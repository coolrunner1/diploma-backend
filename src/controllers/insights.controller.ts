import { NextFunction, Request, Response } from "express";
import { boardQuerySchema } from "../schemas/index.js";
import { insightsService } from "../services/insights.service.js";

export const getDbHealth = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await insightsService.dbHealth();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getUserCompanies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = Number(req.params.userId);
    const result = await insightsService.getUserWithCompanies(userId);
    if (!result) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getCompanyProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const companyId = Number(req.params.companyId);
    const result = await insightsService.getCompanyWithProjects(companyId);
    if (!result) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getProjectBoard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = Number(req.params.projectId);
    const parsed = boardQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid query parameters", issues: parsed.error.issues });
      return;
    }

    const result = await insightsService.getProjectBoard(projectId, {
      search: parsed.data.search,
      type: parsed.data.type,
      status: parsed.data.status
    });

    if (!result) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getTaskDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const taskId = Number(req.params.taskId);
    const result = await insightsService.getTaskWithComments(taskId);
    if (!result) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const searchTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const q = String(req.query.q ?? "").trim();
    if (!q) {
      res.status(400).json({ message: "Query parameter 'q' is required" });
      return;
    }

    const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
    const statusId = req.query.statusId ? Number(req.query.statusId) : undefined;
    const tasks = await insightsService.searchTasks(q, projectId, statusId);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};
