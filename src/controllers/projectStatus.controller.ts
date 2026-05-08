import { NextFunction, Request, Response } from "express";
import { projectStatusService } from "../services/projectStatus.service.js";

export const listProjectStatuses = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rows = await projectStatusService.list();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const createProjectStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const created = await projectStatusService.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const deleteProjectStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = Number(req.params.projectId);
    const statusId = Number(req.params.statusId);
    await projectStatusService.remove(projectId, statusId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
