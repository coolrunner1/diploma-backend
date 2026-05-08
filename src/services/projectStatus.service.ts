import { prisma } from "../lib/prisma.js";

export const projectStatusService = {
  list() {
    return prisma.projectStatus.findMany();
  },
  create(data: { projectId: number; statusId: number }) {
    return prisma.projectStatus.create({ data });
  },
  remove(projectId: number, statusId: number) {
    return prisma.projectStatus.delete({ where: { projectId_statusId: { projectId, statusId } } });
  }
};
