import { randomUUID } from "crypto";
import { prisma } from "../lib/prisma.js";
import { isPredeterminedStatus } from "../constants/statuses.js";
import { withGeneratedUuid } from "../lib/uuid.js";

const DEFAULT_STATUSES = [
  { id: 1, title: "To Do", position: 1, bgColor: "#9ca3af", final: false },
  { id: 2, title: "In Progress", position: 2, bgColor: "#3b82f6", final: false },
  { id: 3, title: "In Testing", position: 3, bgColor: "#f59e0b", final: false },
  { id: 4, title: "Rejected", position: 4, bgColor: "#ef4444", final: false },
  { id: 5, title: "Done", position: 5, bgColor: "#10b981", final: true }
] as const;

type ProjectCreateInput = {
  title: string;
  description?: string | null;
  editableStatuses: boolean;
  companyId: number;
  startDate?: Date | null;
  endDate?: Date | null;
};

const assertStatusMutable = (statusId: number): void => {
  if (isPredeterminedStatus(statusId)) {
    throw Object.assign(new Error("Predetermined statuses cannot be modified or deleted"), { statusCode: 403 });
  }
};

export const projectScopedService = {
  getProjectBrief(projectId: number) {
    return prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, title: true }
    });
  },

  async createProjectWithStatuses(data: ProjectCreateInput) {
    return prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: withGeneratedUuid({
          title: data.title,
          description: data.description,
          editableStatuses: data.editableStatuses,
          companyId: data.companyId,
          startDate: data.startDate,
          endDate: data.endDate
        }) as never
      });

      if (!data.editableStatuses) {
        for (const status of DEFAULT_STATUSES) {
          let existing = await tx.status.findFirst({
            where: { OR: [{ id: status.id }, { title: status.title }] }
          });
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
          await tx.projectStatus.upsert({
            where: { projectId_statusId: { projectId: project.id, statusId: existing.id } },
            create: { projectId: project.id, statusId: existing.id },
            update: {}
          });
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
    return statuses.map((row) => ({
      ...row.status,
      editable: !isPredeterminedStatus(row.status.id)
    }));
  },

  async addProjectStatus(projectId: number, data: Record<string, unknown>) {
    return prisma.$transaction(async (tx) => {
      const status = await tx.status.create({
        data: withGeneratedUuid(data) as never
      });
      await tx.projectStatus.create({ data: { projectId, statusId: status.id } });
      return { ...status, editable: true };
    });
  },

  async updateProjectStatus(projectId: number, statusId: number, data: Record<string, unknown>) {
    assertStatusMutable(statusId);

    const link = await prisma.projectStatus.findUnique({
      where: { projectId_statusId: { projectId, statusId } }
    });
    if (!link) {
      return null;
    }

    const updated = await prisma.status.update({
      where: { id: statusId },
      data
    });
    return { ...updated, editable: true };
  },

  async deleteProjectStatus(projectId: number, statusId: number) {
    assertStatusMutable(statusId);

    const link = await prisma.projectStatus.findUnique({
      where: { projectId_statusId: { projectId, statusId } }
    });
    if (!link) {
      return false;
    }

    await prisma.$transaction(async (tx) => {
      await tx.projectStatus.delete({
        where: { projectId_statusId: { projectId, statusId } }
      });

      const otherLinks = await tx.projectStatus.count({
        where: { statusId, projectId: { not: projectId } }
      });
      if (otherLinks === 0) {
        await tx.status.delete({ where: { id: statusId } });
      }
    });

    return true;
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

  createProjectTask(projectId: number, data: Record<string, unknown>) {
    const payload: Record<string, unknown> = withGeneratedUuid({ ...data, projectId });
    if (Array.isArray(payload.subtasks)) {
      payload.subtasks = (payload.subtasks as Array<Record<string, unknown>>).map((s) =>
        s.uuid ? s : withGeneratedUuid(s)
      );
    }
    return prisma.task.create({ data: payload as never });
  },

  getProjectTask(projectId: number, taskId: number) {
    return prisma.task.findFirst({
      where: { id: taskId, projectId },
      include: { user: true, status: true, comments: true }
    });
  },

  async updateProjectTask(projectId: number, taskId: number, data: Record<string, unknown>) {
    const payload = { ...data };
    delete payload.uuid;
    if (Array.isArray(payload.subtasks)) {
      payload.subtasks = (payload.subtasks as Array<Record<string, unknown>>).map((s) =>
        s.uuid ? s : withGeneratedUuid(s)
      );
    }

    const result = await prisma.task.updateMany({
      where: { id: taskId, projectId },
      data: payload
    });
    return result;
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
