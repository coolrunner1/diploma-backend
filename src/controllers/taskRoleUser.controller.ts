import { NextFunction, Request, Response } from "express";
import { taskRoleUserService } from "../services/taskRoleUser.service.js";

export const listTaskRoleUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rows = await taskRoleUserService.list();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const createTaskRoleUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const created = await taskRoleUserService.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const deleteTaskRoleUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = Number(req.params.userId);
    const taskId = Number(req.params.taskId);
    const roleId = Number(req.params.roleId);
    await taskRoleUserService.remove(userId, taskId, roleId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
