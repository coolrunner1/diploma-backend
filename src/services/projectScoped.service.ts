import { randomUUID } from "crypto";
import { prisma } from "../lib/prisma.js";

const DEFAULT_STATUSES = [
  { title: "To Do", position: 1, bgColor: "#9ca3af", final: false },
  { title: "In Progress", position: 2, bgColor: "#3b82f6", final: false },
  { title: "In Testing", position: 3, bgColor: "#f59e0b", final: false },
  { title: "Rejected", position: 4, bgColor: "#ef4444", final: false },
  { title: "Done", position: 5, bgColor: "#10b981", final: true }
] as const;

type ProjectCreateInput = {
  uuid: string;
  title: string;
  description?: string | null;
  editableStatuses: boolean;
  companyId: number;
  startDate?: Date | null;
  endDate?: Date | null;
};

export const projectScopedService = {
  async createProjectWithStatuses(data: ProjectCreateInput) {
    return prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          uuid: data.uuid,
          title: data.title,
          description: data.description,
          editableStatuses: data.editableStatuses,
          companyId: data.companyId,
          startDate: data.startDate,
          endDate: data.endDate
        }
      });

      if (!data.editableStatuses) {
        for (const status of DEFAULT_STATUSES) {
          let existing = await tx.status.findFirst({ where: { title: status.title } });
          if (!existing) {
            existing = await tx.status.create({
              data: {
                uuid: `global-${status.title.toLowerCase().replace(/\s+/g, "-")}`,
                title: status.title,
                description: null,
                position: status.position,
                bgColor: status.bgColor,
                final: status.final
              }
            });
          }
          await tx.projectStatus.create({ data: { projectId: project.id, statusId: existing.id } });
        }
      } else {
        for (const status of DEFAULT_STATUSES) {
          const created = await tx.status.create({
            data: {
              uuid: randomUUID(),
              title: status.title,
              description: null,
              position: status.position,
              bgColor: status.bgColor,
              final: status.final
            }
          });
          await tx.projectStatus.create({ data: { projectId: project.id, statusId: created.id } });
        }
      }

      return project;
    });
  },

  async listProjectStatuses(projectId: number) {
    const statuses = await prisma.projectStatus.findMany({
      where: { projectId },
      include: { status: true },
      orderBy: { status: { position: "asc" } }
    });
    return statuses.map((row) => row.status);
  },

  async addProjectStatus(projectId: number, data: any) {
    return prisma.$transaction(async (tx) => {
      const status = await tx.status.create({ data });
      await tx.projectStatus.create({ data: { projectId, statusId: status.id } });
      return status;
    });
  },

  async listProjectMembers(projectId: number) {
    return prisma.projectUser.findMany({
      where: { projectId },
      include: { user: true }
    });
  },

  addProjectMember(projectId: number, userId: number) {
    return prisma.projectUser.create({ data: { projectId, userId } });
  },

  removeProjectMember(projectId: number, userId: number) {
    return prisma.projectUser.deleteMany({ where: { projectId, userId } });
  },

  listProjectTasks(projectId: number) {
    return prisma.task.findMany({
      where: { projectId },
      include: { user: true, status: true },
      orderBy: [{ position: "asc" }]
    });
  },

  createProjectTask(projectId: number, data: any) {
    return prisma.task.create({ data: { ...data, projectId } });
  },

  getProjectTask(projectId: number, taskId: number) {
    return prisma.task.findFirst({
      where: { id: taskId, projectId },
      include: { user: true, status: true, comments: true }
    });
  },

  updateProjectTask(projectId: number, taskId: number, data: any) {
    return prisma.task.updateMany({
      where: { id: taskId, projectId },
      data
    });
  },

  deleteProjectTask(projectId: number, taskId: number) {
    return prisma.task.deleteMany({ where: { id: taskId, projectId } });
  },

  listTaskComments(projectId: number, taskId: number) {
    return prisma.comment.findMany({
      where: { taskId, task: { projectId } },
      include: { user: true }
    });
  },

  createTaskComment(projectId: number, taskId: number, data: { userId: number; text: string }) {
    return prisma.comment.create({
      data: { ...data, taskId },
      include: { user: true }
    });
  }
};
