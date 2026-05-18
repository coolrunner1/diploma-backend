import { NextFunction, Request, Response } from "express";
import { aiConfig } from "../config/ai.js";
import { aiCommentSummaryService } from "../services/aiCommentSummary.service.js";
import { aiTaskCheckService } from "../services/aiTaskCheck.service.js";
import { assigneeLoadService } from "../services/assigneeLoad.service.js";
import { prisma } from "../lib/prisma.js";

const parseProjectId = (req: Request): number => Number(req.params.projectId);
const parseTaskId = (req: Request): number => Number(req.params.taskId);

export const checkTaskCorrectness = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = parseProjectId(req);
    const { title, description, assignee } = req.body as {
      title: string;
      description: string;
      assignee: number;
    };

    const user = await prisma.user.findUnique({ where: { id: assignee }, select: { id: true } });
    if (!user) {
      res.status(404).json({ message: "Assignee not found" });
      return;
    }

    const inProject = await assigneeLoadService.assertAssigneeInProject(assignee, projectId);
    if (!inProject) {
      res.status(400).json({ message: "Assignee is not a member of this project" });
      return;
    }

    const assigneeLoad = await assigneeLoadService.getLoad(assignee, projectId);
    const aiEnabled = aiTaskCheckService.isEnabled();

    let review = null;
    let meta: { model?: string; latencyMs?: number } | undefined;

    if (aiEnabled) {
      const started = Date.now();
      review = await aiTaskCheckService.reviewTask(projectId, { title, description });
      meta = {
        model: aiConfig.gigachatModel(),
        latencyMs: Date.now() - started
      };
    }

    res.json({
      ai: { enabled: aiEnabled },
      assignee: assigneeLoad,
      review,
      meta
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskCommentSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = parseProjectId(req);
    const taskId = parseTaskId(req);
    const refresh = req.query.refresh === "true" || req.query.refresh === "1";

    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      select: { commentSummary: true, messageCount: true }
    });
    if (!task) {
      res.status(404).json({ message: "Task not found in this project" });
      return;
    }

    if (refresh && aiCommentSummaryService.isEnabled()) {
      const result = await aiCommentSummaryService.summarizeTaskComments(projectId, taskId);
      res.json({
        ai: { enabled: true },
        summary: result.summary,
        commentCount: result.commentCount,
        refreshed: true
      });
      return;
    }

    res.json({
      ai: { enabled: aiCommentSummaryService.isEnabled() },
      summary: task.commentSummary,
      commentCount: task.messageCount,
      refreshed: false
    });
  } catch (error) {
    next(error);
  }
};

export const refreshTaskCommentSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = parseProjectId(req);
    const taskId = parseTaskId(req);

    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      select: { id: true }
    });
    if (!task) {
      res.status(404).json({ message: "Task not found in this project" });
      return;
    }

    const result = await aiCommentSummaryService.summarizeTaskComments(projectId, taskId);
    res.json({
      ai: { enabled: true },
      summary: result.summary,
      commentCount: result.commentCount,
      refreshed: true
    });
  } catch (error) {
    next(error);
  }
};
