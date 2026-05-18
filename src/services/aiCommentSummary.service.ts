import { prisma } from "../lib/prisma.js";
import { aiConfig } from "../config/ai.js";
import { AiFeatureDisabledError } from "../errors/ai.js";
import { gigachatService } from "./gigachat.service.js";

export const aiCommentSummaryService = {
  isEnabled(): boolean {
    return aiConfig.isCommentSummaryEnabled();
  },

  async summarizeTaskComments(projectId: number, taskId: number): Promise<{ summary: string; commentCount: number }> {
    if (!this.isEnabled()) {
      throw new AiFeatureDisabledError("comment_summary");
    }

    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      select: { id: true, title: true, description: true }
    });
    if (!task) {
      throw new Error("Task not found");
    }

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: { user: { select: { name: true, surname: true } } },
      orderBy: { id: "asc" }
    });

    if (comments.length === 0) {
      const empty = "";
      await prisma.task.update({
        where: { id: taskId },
        data: { commentSummary: empty, messageCount: 0 }
      });
      return { summary: empty, commentCount: 0 };
    }

    const thread = comments
      .map((c, i) => `${i + 1}. ${c.user.name} ${c.user.surname}: ${c.text}`)
      .join("\n");

    const summary = await gigachatService.chat([
      {
        role: "system",
        content:
          "Summarize the task discussion concisely for a developer who has not read the thread. Capture decisions, blockers, and action items. Use plain text, no bullet markdown headers. Max 8 sentences."
      },
      {
        role: "user",
        content: `Task: ${task.title}\nTask description: ${task.description}\n\nComments:\n${thread}`
      }
    ]);

    const maxChars = aiConfig.commentSummaryMaxChars();
    const trimmed = summary.length > maxChars ? `${summary.slice(0, maxChars - 1)}…` : summary;

    await prisma.task.update({
      where: { id: taskId },
      data: {
        commentSummary: trimmed,
        messageCount: comments.length
      }
    });

    return { summary: trimmed, commentCount: comments.length };
  }
};
