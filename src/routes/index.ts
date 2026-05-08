import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { validateBody } from "../lib/validate.js";
import {
  commentCreate,
  commentUpdate,
  companyCreate,
  companyUpdate,
  globalRoleCreate,
  globalRoleUpdate,
  projectCreate,
  projectRoleCreate,
  projectRoleUpdate,
  projectStatusCreate,
  projectUpdate,
  projectUserCreate,
  projectUserUpdate,
  statusCreate,
  statusUpdate,
  taskCreate,
  taskRoleCreate,
  taskRoleUpdate,
  taskRoleUserCreate,
  taskUpdate,
  userCompanyCreate,
  userCompanyUpdate,
  userCreate,
  userRoleInProjectCreate,
  userRoleInProjectUpdate,
  userUpdate
} from "../schemas/index.js";
import { makeCrudRouter } from "./crud.js";
import { getHealth } from "../controllers/health.controller.js";
import {
  createProjectStatus,
  deleteProjectStatus,
  listProjectStatuses
} from "../controllers/projectStatus.controller.js";
import {
  createTaskRoleUser,
  deleteTaskRoleUser,
  listTaskRoleUsers
} from "../controllers/taskRoleUser.controller.js";
import {
  getCompanyProjects,
  getDbHealth,
  getProjectBoard,
  getTaskDetails,
  getUserCompanies,
  searchTasks
} from "../controllers/insights.controller.js";

export const apiRouter = Router();

apiRouter.get("/health", getHealth);
apiRouter.get("/health/db", getDbHealth);

apiRouter.use("/api/global-roles", makeCrudRouter(prisma.globalRole, globalRoleCreate, globalRoleUpdate));
apiRouter.use("/api/project-roles", makeCrudRouter(prisma.projectRole, projectRoleCreate, projectRoleUpdate));
apiRouter.use("/api/statuses", makeCrudRouter(prisma.status, statusCreate, statusUpdate));
apiRouter.use("/api/task-roles", makeCrudRouter(prisma.taskRole, taskRoleCreate, taskRoleUpdate));
apiRouter.use("/api/users", makeCrudRouter(prisma.user, userCreate, userUpdate));
apiRouter.use("/api/companies", makeCrudRouter(prisma.company, companyCreate, companyUpdate));
apiRouter.use("/api/projects", makeCrudRouter(prisma.project, projectCreate, projectUpdate));
apiRouter.use("/api/user-companies", makeCrudRouter(prisma.userCompany, userCompanyCreate, userCompanyUpdate));
apiRouter.use("/api/project-users", makeCrudRouter(prisma.projectUser, projectUserCreate, projectUserUpdate));
apiRouter.use("/api/tasks", makeCrudRouter(prisma.task, taskCreate, taskUpdate));
apiRouter.use(
  "/api/user-role-in-projects",
  makeCrudRouter(prisma.userRoleInProject, userRoleInProjectCreate, userRoleInProjectUpdate)
);
apiRouter.use("/api/comments", makeCrudRouter(prisma.comment, commentCreate, commentUpdate));

apiRouter.get("/api/project-statuses", listProjectStatuses);
apiRouter.post("/api/project-statuses", validateBody(projectStatusCreate), createProjectStatus);
apiRouter.delete("/api/project-statuses/:projectId/:statusId", deleteProjectStatus);

apiRouter.get("/api/task-role-users", listTaskRoleUsers);
apiRouter.post("/api/task-role-users", validateBody(taskRoleUserCreate), createTaskRoleUser);
apiRouter.delete("/api/task-role-users/:userId/:taskId/:roleId", deleteTaskRoleUser);

apiRouter.get("/api/users/:userId/companies", getUserCompanies);
apiRouter.get("/api/companies/:companyId/projects", getCompanyProjects);
apiRouter.get("/api/projects/:projectId/board", getProjectBoard);
apiRouter.get("/api/tasks/:taskId/details", getTaskDetails);
apiRouter.get("/api/tasks/search", searchTasks);
