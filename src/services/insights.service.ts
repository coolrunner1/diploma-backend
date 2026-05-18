import { Prisma, task_type } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export type BoardFilters = {
  search?: string;
  type?: task_type;
  status?: number;
};

type TagItem = { uuid: string; title: string };

const taskMatchesSearch = (task: { title: string; description: string; tags: unknown }, search: string): boolean => {
  const q = search.toLowerCase();
  if (task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q)) {
    return true;
  }

  if (Array.isArray(task.tags)) {
    return (task.tags as TagItem[]).some(
      (tag) => tag.title?.toLowerCase().includes(q) || tag.uuid?.toLowerCase().includes(q)
    );
  }

  return JSON.stringify(task.tags).toLowerCase().includes(q);
};

export const insightsService = {
  async dbHealth() {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  },

  getUserWithCompanies(userId: number) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        globalRole: true,
        userCompanies: {
          include: {
            company: true
          }
        }
      }
    });
  },

  getCompanyWithProjects(companyId: number) {
    return prisma.company.findUnique({
      where: { id: companyId },
      include: {
        owner: true,
        projects: true,
        userCompany: {
          include: {
            user: true
          }
        }
      }
    });
  },

  async getProjectBoard(projectId: number, filters: BoardFilters = {}) {
    const taskWhere: Prisma.TaskWhereInput = { projectId };

    if (filters.type) {
      taskWhere.type = filters.type;
    }
    if (filters.status) {
      taskWhere.statusId = filters.status;
    }
    if (filters.search) {
      taskWhere.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } }
      ];
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        projectStatus: {
          where: filters.status ? { statusId: filters.status } : undefined,
          include: { status: true },
          orderBy: { status: { position: "asc" } }
        },
        tasks: {
          where: taskWhere,
          include: {
            status: true,
            user: {
              select: {
                id: true,
                uuid: true,
                login: true,
                name: true,
                surname: true,
                bgColor: true,
                email: true,
                globalRoleId: true,
                createdAt: true
              }
            }
          },
          orderBy: [{ position: "asc" }]
        }
      }
    });

    if (!project) {
      return null;
    }

    let tasks = project.tasks;
    if (filters.search) {
      tasks = tasks.filter((task) => taskMatchesSearch(task, filters.search!));
    }

    const blockerIds = [...new Set(tasks.map((t) => t.blockedBy).filter((id) => id > 0))];
    const blockers =
      blockerIds.length > 0
        ? await prisma.task.findMany({
            where: { id: { in: blockerIds }, projectId },
            select: { id: true, uuid: true, title: true, statusId: true }
          })
        : [];
    const blockerMap = new Map(blockers.map((b) => [b.id, b]));

    return {
      id: project.id,
      uuid: project.uuid,
      title: project.title,
      description: project.description,
      editableStatuses: project.editableStatuses,
      companyId: project.companyId,
      startDate: project.startDate,
      endDate: project.endDate,
      statuses: project.projectStatus.map((ps) => ps.status),
      tasks: tasks.map((task) => ({
        ...task,
        assignee: task.user,
        user: undefined,
        blocker:
          task.blockedBy > 0
            ? (blockerMap.get(task.blockedBy) ?? { id: task.blockedBy, uuid: null, title: null, statusId: null })
            : null
      }))
    };
  },

  getTaskWithComments(taskId: number) {
    return prisma.task.findUnique({
      where: { id: taskId },
      include: {
        user: true,
        status: true,
        comments: {
          include: {
            user: true
          }
        },
        taskRoleUser: {
          include: {
            user: true,
            role: true
          }
        }
      }
    });
  },

  searchTasks(search: string, projectId?: number, statusId?: number) {
    return prisma.task.findMany({
      where: {
        projectId,
        statusId,
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { commentSummary: { contains: search, mode: "insensitive" } }
        ]
      },
      include: {
        user: true,
        status: true,
        project: true
      },
      orderBy: [{ position: "asc" }]
    });
  }
};
