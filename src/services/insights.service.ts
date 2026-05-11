import { prisma } from "../lib/prisma.js";

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

  async getProjectBoard(projectId: number) {
    return prisma.project.findUnique({
      where: { id: projectId },
      include: {
        projectStatus: {
          include: {
            status: true
          }
        },
        tasks: {
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
    }).then((project) => {
      if (!project) return null;

      return {
        ...project,

        projectStatus: project.projectStatus.map((ps) => ({
          ...ps.status
        })),

        tasks: project.tasks.map((task) => ({
          ...task,
          assignee: task.user,
          user: undefined
        }))
      };
    });
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
