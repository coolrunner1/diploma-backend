import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { scheduleCommentSummaryRefresh } from "../lib/aiSchedule.js";
import { safeNotify } from "../lib/notify.js";
import { notificationDispatch } from "../services/notificationDispatch.js";
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

export const updateProjectStatusScoped = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const statusId = Number(req.params.statusId);
    const updated = await projectScopedService.updateProjectStatus(
      parseProjectId(req),
      statusId,
      req.body
    );
    if (!updated) {
      res.status(404).json({ message: "Status not found in this project" });
      return;
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteProjectStatusScoped = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const statusId = Number(req.params.statusId);
    const deleted = await projectScopedService.deleteProjectStatus(parseProjectId(req), statusId);
    if (!deleted) {
      res.status(404).json({ message: "Status not found in this project" });
      return;
    }
    res.status(204).send();
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
    const projectId = parseProjectId(req);
    const member = await projectScopedService.addProjectMember(projectId, req.body.userId);
    const project = await projectScopedService.getProjectBrief(projectId);

    if (project) {
      safeNotify(() =>
        notificationDispatch.projectMemberAdded({
          memberId: req.body.userId,
          projectId,
          projectTitle: project.title,
          actorUserId: req.actorUserId
        })
      );
    }

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
    const projectId = parseProjectId(req);
    const task = await projectScopedService.createProjectTask(projectId, req.body);
    const project = await projectScopedService.getProjectBrief(projectId);

    if (project) {
      safeNotify(() =>
        notificationDispatch.taskAssigned({
          assigneeId: task.userId,
          taskId: task.id,
          taskTitle: task.title,
          projectId,
          projectTitle: project.title,
          actorUserId: req.actorUserId
        })
      );
    }

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
    const projectId = parseProjectId(req);
    const taskId = parseTaskId(req);
    const before = await projectScopedService.getProjectTask(projectId, taskId);

    const result = await projectScopedService.updateProjectTask(projectId, taskId, req.body);
    if (result.count === 0 || !before) {
      res.status(404).json({ message: "Task not found in this project" });
      return;
    }

    const after = await projectScopedService.getProjectTask(projectId, taskId);
    const project = await projectScopedService.getProjectBrief(projectId);

    if (after && project) {
      if (req.body.userId !== undefined && before.userId !== after.userId) {
        safeNotify(() =>
          notificationDispatch.taskAssigned({
            assigneeId: after.userId,
            taskId: after.id,
            taskTitle: after.title,
            projectId,
            projectTitle: project.title,
            actorUserId: req.actorUserId
          })
        );
      }

      if (req.body.statusId !== undefined && before.statusId !== after.statusId && after.status) {
        safeNotify(() =>
          notificationDispatch.taskStatusChanged({
            recipientId: after.userId,
            taskId: after.id,
            taskTitle: after.title,
            projectId,
            statusTitle: after.status.title,
            actorUserId: req.actorUserId
          })
        );
      }

      if (req.body.blockedBy !== undefined && after.blockedBy > 0 && before.blockedBy !== after.blockedBy) {
        safeNotify(async () => {
          const blocker = await prisma.task.findFirst({
            where: { id: after.blockedBy, projectId },
            select: { id: true, title: true }
          });
          if (!blocker) return;
          await notificationDispatch.taskBlocked({
            recipientId: after.userId,
            taskId: after.id,
            taskTitle: after.title,
            projectId,
            blockerTaskId: blocker.id,
            blockerTitle: blocker.title,
            actorUserId: req.actorUserId
          });
        });
      }
    }

    res.json(after);
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
    const projectId = parseProjectId(req);
    const taskId = parseTaskId(req);
    const task = await projectScopedService.getProjectTask(projectId, taskId);
    if (!task) {
      res.status(404).json({ message: "Task not found in this project" });
      return;
    }

    const comment = await projectScopedService.createTaskComment(projectId, taskId, req.body);

    scheduleCommentSummaryRefresh(projectId, taskId);

    safeNotify(() =>
      notificationDispatch.taskComment({
        recipientId: task.userId,
        taskId: task.id,
        taskTitle: task.title,
        projectId,
        commentId: comment.id,
        actorUserId: req.body.userId
      })
    );

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};
