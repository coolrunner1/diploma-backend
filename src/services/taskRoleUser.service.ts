import { prisma } from "../lib/prisma.js";

export const taskRoleUserService = {
  list() {
    return prisma.taskRoleUser.findMany();
  },
  async getAssignmentContext(taskId: number) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        title: true,
        projectId: true,
        project: { select: { title: true } }
      }
    });
    if (!task) return null;
    return {
      taskId: task.id,
      taskTitle: task.title,
      projectId: task.projectId,
      projectTitle: task.project.title
    };
  },
  create(data: { userId: number; taskId: number; roleId: number }) {
    return prisma.taskRoleUser.create({ data });
  },
  remove(userId: number, taskId: number, roleId: number) {
    return prisma.taskRoleUser.delete({ where: { userId_taskId_roleId: { userId, taskId, roleId } } });
  }
};
