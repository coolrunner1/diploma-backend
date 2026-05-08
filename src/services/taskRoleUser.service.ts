import { prisma } from "../lib/prisma.js";

export const taskRoleUserService = {
  list() {
    return prisma.taskRoleUser.findMany();
  },
  create(data: { userId: number; taskId: number; roleId: number }) {
    return prisma.taskRoleUser.create({ data });
  },
  remove(userId: number, taskId: number, roleId: number) {
    return prisma.taskRoleUser.delete({ where: { userId_taskId_roleId: { userId, taskId, roleId } } });
  }
};
