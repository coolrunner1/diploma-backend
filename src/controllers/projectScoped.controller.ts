import { NextFunction, Request, Response } from "express";
import { projectScopedService } from "../services/projectScoped.service.js";

const parseProjectId = (req: Request): number => Number(req.params.projectId);
const parseTaskId = (req: Request): number => Number(req.params.taskId);

export const createProjectWithStatuses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const created = await projectScopedService.createProjectWithStatuses(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const listProjectStatusesScoped = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const statuses = await projectScopedService.listProjectStatuses(parseProjectId(req));
    res.json(statuses);
  } catch (error) {
    next(error);
  }
};

export const addProjectStatusScoped = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const status = await projectScopedService.addProjectStatus(parseProjectId(req), req.body);
    res.status(201).json(status);
  } catch (error) {
    next(error);
  }
};

export const listProjectMembersScoped = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const members = await projectScopedService.listProjectMembers(parseProjectId(req));
    res.json(members);
  } catch (error) {
    next(error);
  }
};

export const addProjectMemberScoped = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const member = await projectScopedService.addProjectMember(parseProjectId(req), req.body.userId);
    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
};

export const removeProjectMemberScoped = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await projectScopedService.removeProjectMember(parseProjectId(req), Number(req.params.userId));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const listProjectTasksScoped = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tasks = await projectScopedService.listProjectTasks(parseProjectId(req));
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const createProjectTaskScoped = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await projectScopedService.createProjectTask(parseProjectId(req), req.body);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const getProjectTaskScoped = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await projectScopedService.getProjectTask(parseProjectId(req), parseTaskId(req));
    if (!task) {
      res.status(404).json({ message: "Task not found in this project" });
      return;
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const updateProjectTaskScoped = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await projectScopedService.updateProjectTask(parseProjectId(req), parseTaskId(req), req.body);
    if (result.count === 0) {
      res.status(404).json({ message: "Task not found in this project" });
      return;
    }
    const task = await projectScopedService.getProjectTask(parseProjectId(req), parseTaskId(req));
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteProjectTaskScoped = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await projectScopedService.deleteProjectTask(parseProjectId(req), parseTaskId(req));
    if (result.count === 0) {
      res.status(404).json({ message: "Task not found in this project" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const listTaskCommentsScoped = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comments = await projectScopedService.listTaskComments(parseProjectId(req), parseTaskId(req));
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

export const createTaskCommentScoped = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comment = await projectScopedService.createTaskComment(parseProjectId(req), parseTaskId(req), req.body);
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};
