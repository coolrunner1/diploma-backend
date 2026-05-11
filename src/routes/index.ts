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
  projectCommentCreate,
  projectMemberCreate,
  projectRoleCreate,
  projectRoleUpdate,
  projectStatusCreateForProject,
  projectUpdate,
  projectUserCreate,
  projectUserUpdate,
  statusCreate,
  statusUpdate,
  projectTaskCreate,
  projectTaskUpdate,
  taskRoleUserCreate,
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
import { requireProjectContext } from "../middlewares/projectAccess.js";
import {
  addProjectMemberScoped,
  addProjectStatusScoped,
  createProjectTaskScoped,
  createProjectWithStatuses,
  createTaskCommentScoped,
  deleteProjectTaskScoped,
  getProjectTaskScoped,
  listProjectMembersScoped,
  listProjectStatusesScoped,
  listProjectTasksScoped,
  listTaskCommentsScoped,
  removeProjectMemberScoped,
  updateProjectTaskScoped
} from "../controllers/projectScoped.controller.js";

export const apiRouter = Router();
const v1 = Router();

v1.get("/health", getHealth);
v1.get("/health/db", getDbHealth);

v1.use("/global-roles", makeCrudRouter(prisma.globalRole, globalRoleCreate, globalRoleUpdate));
v1.use("/project-roles", makeCrudRouter(prisma.projectRole, projectRoleCreate, projectRoleUpdate));
v1.use("/statuses", makeCrudRouter(prisma.status, statusCreate, statusUpdate));
v1.use("/users", makeCrudRouter(prisma.user, userCreate, userUpdate));
v1.use("/companies", makeCrudRouter(prisma.company, companyCreate, companyUpdate));
v1.use("/projects", makeCrudRouter(prisma.project, projectCreate, projectUpdate));
v1.use("/user-companies", makeCrudRouter(prisma.userCompany, userCompanyCreate, userCompanyUpdate));
v1.use("/project-users", makeCrudRouter(prisma.projectUser, projectUserCreate, projectUserUpdate));
v1.use(
  "/user-role-in-projects",
  makeCrudRouter(prisma.userRoleInProject, userRoleInProjectCreate, userRoleInProjectUpdate)
);
v1.use("/comments", makeCrudRouter(prisma.comment, commentCreate, commentUpdate));

v1.get("/project-statuses", listProjectStatuses);
v1.post("/project-statuses", validateBody(projectStatusCreateForProject), createProjectStatus);
v1.delete("/project-statuses/:projectId/:statusId", deleteProjectStatus);

v1.get("/task-role-users", listTaskRoleUsers);
v1.post("/task-role-users", validateBody(taskRoleUserCreate), createTaskRoleUser);
v1.delete("/task-role-users/:userId/:taskId/:roleId", deleteTaskRoleUser);

v1.get("/users/:userId/companies", getUserCompanies);
v1.get("/companies/:companyId/projects", getCompanyProjects);
v1.get("/projects/:projectId/board", getProjectBoard);
v1.get("/tasks/:taskId/details", getTaskDetails);
v1.get("/tasks/search", searchTasks);

v1.post("/projects/with-status-mode", validateBody(projectCreate), createProjectWithStatuses);

const projectRouter = Router({ mergeParams: true });
projectRouter.use(requireProjectContext);
projectRouter.get("/statuses", listProjectStatusesScoped);
projectRouter.post("/statuses", validateBody(projectStatusCreateForProject), addProjectStatusScoped);
projectRouter.get("/members", listProjectMembersScoped);
projectRouter.post("/members", validateBody(projectMemberCreate), addProjectMemberScoped);
projectRouter.delete("/members/:userId", removeProjectMemberScoped);
projectRouter.get("/tasks", listProjectTasksScoped);
projectRouter.post("/tasks", validateBody(projectTaskCreate), createProjectTaskScoped);
projectRouter.get("/tasks/:taskId", getProjectTaskScoped);
projectRouter.put("/tasks/:taskId", validateBody(projectTaskUpdate), updateProjectTaskScoped);
projectRouter.delete("/tasks/:taskId", deleteProjectTaskScoped);
projectRouter.get("/tasks/:taskId/comments", listTaskCommentsScoped);
projectRouter.post("/tasks/:taskId/comments", validateBody(projectCommentCreate), createTaskCommentScoped);

v1.use("/project/:projectId", projectRouter);
apiRouter.use("/api/v1", v1);
