import { prisma } from "../lib/prisma.js";
import { aiConfig } from "../config/ai.js";

export type AssigneeLoad = {
  userId: number;
  openTasksGlobal: number;
  openTasksInProject: number;
  overloaded: boolean;
  thresholdGlobal: number;
  thresholdProject: number;
};

export const assigneeLoadService = {
  async getLoad(userId: number, projectId: number): Promise<AssigneeLoad> {
    const openWhere = {
      userId,
      status: { final: false }
    };

    const [openTasksGlobal, openTasksInProject] = await Promise.all([
      prisma.task.count({ where: openWhere }),
      prisma.task.count({ where: { ...openWhere, projectId } })
    ]);

    const thresholdGlobal = aiConfig.maxOpenTasksGlobal();
    const thresholdProject = aiConfig.maxOpenTasksInProject();

    return {
      userId,
      openTasksGlobal,
      openTasksInProject,
      overloaded: openTasksGlobal >= thresholdGlobal || openTasksInProject >= thresholdProject,
      thresholdGlobal,
      thresholdProject
    };
  },

  async assertAssigneeInProject(userId: number, projectId: number): Promise<boolean> {
    const member = await prisma.projectUser.findFirst({
      where: { userId, projectId }
    });
    if (member) {
      return true;
    }

    const assignedTask = await prisma.task.findFirst({
      where: { userId, projectId },
      select: { id: true }
    });
    return assignedTask !== null;
  }
};
