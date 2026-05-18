import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { validateBody } from "../lib/validate.js";
import { isPredeterminedStatus } from "../constants/statuses.js";
import { hashPassword } from "../lib/password.js";
import { stringToHexColor } from "../lib/utils.js";
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
  projectStatusUpdateForProject,
  projectUpdate,
  projectUserCreate,
  projectUserUpdate,
  statusCreate,
  statusUpdate,
  projectTaskCreate,
  projectTaskUpdate,
  taskCheckCorrectnessBody,
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
import { resolveActor } from "../middlewares/actor.js";
import { requireProjectContext } from "../middlewares/projectAccess.js";
import {
  deleteNotification,
  getUnreadCount,
  listUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationReadForUser
} from "../controllers/notification.controller.js";
import {
  addProjectMemberScoped,
  addProjectStatusScoped,
  createProjectTaskScoped,
  createProjectWithStatuses,
  createTaskCommentScoped,
  deleteProjectStatusScoped,
  deleteProjectTaskScoped,
  getProjectTaskScoped,
  listProjectMembersScoped,
  listProjectStatusesScoped,
  listProjectTasksScoped,
  listTaskCommentsScoped,
  removeProjectMemberScoped,
  updateProjectStatusScoped,
  updateProjectTaskScoped
} from "../controllers/projectScoped.controller.js";
import {
  checkTaskCorrectness,
  getTaskCommentSummary,
  refreshTaskCommentSummary
} from "../controllers/ai.controller.js";

export const apiRouter = Router();
const v1 = Router();

const statusGuardMessage = "Predetermined statuses (id 1-7) cannot be edited or deleted";

v1.use(resolveActor);

v1.get("/health", getHealth);
v1.get("/health/db", getDbHealth);

v1.use("/global-roles", makeCrudRouter(prisma.globalRole, globalRoleCreate, globalRoleUpdate));
v1.use(
  "/project-roles",
  makeCrudRouter(prisma.projectRole, projectRoleCreate, projectRoleUpdate, { generateUuid: true })
);
v1.use(
  "/statuses",
  makeCrudRouter(prisma.status, statusCreate, statusUpdate, {
    generateUuid: true,
    canUpdate: (id) => !isPredeterminedStatus(id),
    canDelete: (id) => !isPredeterminedStatus(id),
    forbiddenMessage: statusGuardMessage
  })
);
v1.use(
  "/users",
  makeCrudRouter(prisma.user, userCreate, userUpdate, {
    generateUuid: true,
    beforeCreate: async (data) => {
      const login = String(data.login);
      return {
        ...data,
        password: await hashPassword(String(data.password)),
        bgColor: data.bgColor ?? stringToHexColor(login),
        createdAt: data.createdAt ?? new Date()
      };
    },
    beforeUpdate: async (data) => {
      const next = { ...data };
      if (typeof next.password === "string") {
        next.password = await hashPassword(next.password);
      }
      return next;
    }
  })
);
v1.use(
  "/companies",
  makeCrudRouter(prisma.company, companyCreate, companyUpdate, { generateUuid: true })
);
v1.use(
  "/projects",
  makeCrudRouter(prisma.project, projectCreate, projectUpdate, { generateUuid: true })
);
v1.use("/user-companies", makeCrudRouter(prisma.userCompany, userCompanyCreate, userCompanyUpdate));
v1.use("/project-users", makeCrudRouter(prisma.projectUser, projectUserCreate, projectUserUpdate));
v1.use(
  "/user-role-in-projects",
  makeCrudRouter(prisma.userRoleInProject, userRoleInProjectCreate, userRoleInProjectUpdate)
);
v1.use("/comments", makeCrudRouter(prisma.comment, commentCreate, commentUpdate));

v1.get("/task-role-users", listTaskRoleUsers);
v1.post("/task-role-users", validateBody(taskRoleUserCreate), createTaskRoleUser);
v1.delete("/task-role-users/:userId/:taskId/:roleId", deleteTaskRoleUser);

v1.get("/users/:userId/notifications", listUserNotifications);
v1.get("/users/:userId/notifications/unread-count", getUnreadCount);
v1.patch("/users/:userId/notifications/read-all", markAllNotificationsRead);
v1.patch("/users/:userId/notifications/:id/read", markNotificationReadForUser);
v1.patch("/notifications/:id/read", markNotificationRead);
v1.delete("/notifications/:id", deleteNotification);

v1.get("/users/:userId/companies", getUserCompanies);
v1.get("/companies/:companyId/projects", getCompanyProjects);
v1.get("/tasks/:taskId/details", getTaskDetails);
v1.get("/tasks/search", searchTasks);

v1.post("/projects/with-status-mode", validateBody(projectCreate), createProjectWithStatuses);

const projectRouter = Router({ mergeParams: true });
projectRouter.use(requireProjectContext);

projectRouter.get("/board", getProjectBoard);
projectRouter.get("/statuses", listProjectStatusesScoped);
projectRouter.post("/statuses", validateBody(projectStatusCreateForProject), addProjectStatusScoped);
projectRouter.put("/statuses/:statusId", validateBody(projectStatusUpdateForProject), updateProjectStatusScoped);
projectRouter.delete("/statuses/:statusId", deleteProjectStatusScoped);
projectRouter.get("/members", listProjectMembersScoped);
projectRouter.post("/members", validateBody(projectMemberCreate), addProjectMemberScoped);
projectRouter.delete("/members/:userId", removeProjectMemberScoped);
projectRouter.get("/tasks", listProjectTasksScoped);
projectRouter.post("/tasks/check-correctness", validateBody(taskCheckCorrectnessBody), checkTaskCorrectness);
projectRouter.post("/tasks", validateBody(projectTaskCreate), createProjectTaskScoped);
projectRouter.get("/tasks/:taskId", getProjectTaskScoped);
projectRouter.put("/tasks/:taskId", validateBody(projectTaskUpdate), updateProjectTaskScoped);
projectRouter.delete("/tasks/:taskId", deleteProjectTaskScoped);
projectRouter.get("/tasks/:taskId/comments", listTaskCommentsScoped);
projectRouter.get("/tasks/:taskId/comments/summary", getTaskCommentSummary);
projectRouter.post("/tasks/:taskId/comments/summary", refreshTaskCommentSummary);
projectRouter.post("/tasks/:taskId/comments", validateBody(projectCommentCreate), createTaskCommentScoped);

v1.use("/projects/:projectId", projectRouter);
apiRouter.use("/api/v1", v1);
