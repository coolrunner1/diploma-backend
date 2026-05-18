import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { aiConfig } from "../config/ai.js";
import { AiFeatureDisabledError } from "../errors/ai.js";
import { extractJsonFromLlm } from "../lib/jsonFromLlm.js";
import { gigachatService } from "./gigachat.service.js";

const taskReviewSchema = z.object({
  relevant: z.boolean(),
  feasible: z.boolean(),
  confidence: z.number().min(0).max(1),
  issues: z.array(z.string()),
  suggestions: z.array(z.string())
});

export type TaskReview = z.infer<typeof taskReviewSchema>;

const truncate = (text: string, max: number): string =>
  text.length <= max ? text : `${text.slice(0, max)}…`;

const buildProjectContext = async (projectId: number): Promise<string> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      projectStatus: {
        include: { status: { select: { title: true, final: true } } }
      },
      tasks: {
        where: { status: { final: false } },
        take: 40,
        orderBy: { id: "desc" },
        select: {
          id: true,
          title: true,
          type: true,
          priority: true,
          description: true,
          status: { select: { title: true } }
        }
      }
    }
  });

  if (!project) {
    return "";
  }

  const statuses = project.projectStatus.map((ps) => `${ps.status.title}${ps.status.final ? " (final)" : ""}`).join(", ");
  const tasks = project.tasks
    .map(
      (t) =>
        `- #${t.id} [${t.type}/${t.priority}] ${t.title} (${t.status.title}): ${truncate(t.description, 180)}`
    )
    .join("\n");

  return [
    `Project: ${project.title}`,
    project.description ? `Description: ${project.description}` : null,
    project.startDate ? `Start: ${project.startDate.toISOString().slice(0, 10)}` : null,
    project.endDate ? `End: ${project.endDate.toISOString().slice(0, 10)}` : null,
    `Workflow statuses: ${statuses || "n/a"}`,
    `Open tasks (${project.tasks.length}):`,
    tasks || "(none)"
  ]
    .filter(Boolean)
    .join("\n");
};

export const aiTaskCheckService = {
  isEnabled(): boolean {
    return aiConfig.isTaskCheckEnabled();
  },

  async reviewTask(
    projectId: number,
    input: { title: string; description: string }
  ): Promise<TaskReview> {
    if (!this.isEnabled()) {
      throw new AiFeatureDisabledError("task_check");
    }

    const context = await buildProjectContext(projectId);
    const content = await gigachatService.chat([
      {
        role: "system",
        content:
          "You are a senior tech lead reviewing backlog items. Assess whether a proposed task fits the project and is feasible. Respond with JSON only, no markdown, using this schema: {\"relevant\":boolean,\"feasible\":boolean,\"confidence\":number,\"issues\":string[],\"suggestions\":string[]}. relevant = aligns with project scope; feasible = realistically implementable given context."
      },
      {
        role: "user",
        content: `${context}\n\n---\nProposed task:\nTitle: ${input.title}\nDescription: ${input.description}`
      }
    ]);

    const parsed = taskReviewSchema.parse(extractJsonFromLlm(content));
    return parsed;
  }
};
