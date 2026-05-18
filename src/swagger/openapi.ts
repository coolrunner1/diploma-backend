export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Task API",
    version: "1.0.0",
    description:
      "Project management API. UUID fields are generated on the server and must not be sent in POST/PUT bodies. Predetermined status IDs 1–7 cannot be edited or deleted."
  },
  servers: [{ url: "/api/v1", description: "API v1" }],
  tags: [
    { name: "Health" },
    { name: "Global Roles" },
    { name: "Project Roles" },
    { name: "Statuses" },
    { name: "Users" },
    { name: "Companies" },
    { name: "Projects" },
    { name: "Project Scope" },
    { name: "Tasks" },
    { name: "Comments" },
    { name: "Relations" },
    { name: "Notifications" },
    { name: "AI" }
  ],
  components: {
    schemas: {
      Error: {
        type: "object",
        properties: { message: { type: "string" } }
      },
      Tag: {
        type: "object",
        required: ["uuid", "title"],
        properties: {
          uuid: { type: "string" },
          title: { type: "string" }
        }
      },
      Subtask: {
        type: "object",
        required: ["uuid", "title", "description"],
        properties: {
          uuid: { type: "string" },
          title: { type: "string" },
          description: { type: "string" }
        }
      },
      TaskType: { type: "string", enum: ["task", "bug", "story", "epic"] },
      TaskPriority: { type: "string", enum: ["low", "medium", "high", "critical"] },
      UserCreate: {
        type: "object",
        required: ["login", "password", "name", "surname", "email", "globalRoleId"],
        properties: {
          login: { type: "string" },
          password: { type: "string", format: "password" },
          name: { type: "string" },
          surname: { type: "string" },
          bgColor: { type: "string", example: "#3b82f6" },
          email: { type: "string", format: "email" },
          globalRoleId: { type: "integer" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      StatusCreate: {
        type: "object",
        required: ["title", "position", "bgColor", "final"],
        properties: {
          title: { type: "string" },
          description: { type: "string", nullable: true },
          position: { type: "integer" },
          bgColor: { type: "string" },
          final: { type: "boolean" }
        }
      },
      ProjectCreate: {
        type: "object",
        required: ["title", "editableStatuses", "companyId"],
        properties: {
          title: { type: "string" },
          description: { type: "string", nullable: true },
          editableStatuses: {
            type: "boolean",
            description: "true = project-specific statuses; false = link global default statuses"
          },
          companyId: { type: "integer" },
          startDate: { type: "string", format: "date", nullable: true },
          endDate: { type: "string", format: "date", nullable: true }
        }
      },
      ProjectTaskCreate: {
        type: "object",
        required: [
          "title",
          "description",
          "commentSummary",
          "userId",
          "statusId",
          "messageCount",
          "position",
          "type",
          "priority",
          "tags",
          "blockedBy",
          "startTimestamp",
          "endTimestamp"
        ],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          commentSummary: { type: "string" },
          userId: { type: "integer" },
          statusId: { type: "integer" },
          messageCount: { type: "integer" },
          position: { type: "integer" },
          type: { $ref: "#/components/schemas/TaskType" },
          priority: { $ref: "#/components/schemas/TaskPriority" },
          tags: { type: "array", items: { $ref: "#/components/schemas/Tag" } },
          subtasks: {
            type: "array",
            nullable: true,
            items: { $ref: "#/components/schemas/Subtask" }
          },
          blockedBy: { type: "integer", description: "Task id that blocks this task (0 = none)" },
          startTimestamp: { type: "string", format: "date-time" },
          endTimestamp: { type: "string", format: "date-time" }
        }
      },
      ProjectCommentCreate: {
        type: "object",
        required: ["userId", "text"],
        properties: {
          userId: { type: "integer" },
          text: { type: "string" }
        }
      },
      TaskCheckCorrectness: {
        type: "object",
        required: ["title", "description", "assignee"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          assignee: { type: "integer", description: "User id of proposed assignee" }
        }
      },
      ProjectMemberCreate: {
        type: "object",
        required: ["userId"],
        properties: { userId: { type: "integer" } }
      }
    },
    parameters: {
      Id: { name: "id", in: "path", required: true, schema: { type: "integer" } },
      ProjectId: { name: "projectId", in: "path", required: true, schema: { type: "integer" } },
      TaskId: { name: "taskId", in: "path", required: true, schema: { type: "integer" } },
      StatusId: { name: "statusId", in: "path", required: true, schema: { type: "integer" } },
      UserId: { name: "userId", in: "path", required: true, schema: { type: "integer" } },
      CompanyId: { name: "companyId", in: "path", required: true, schema: { type: "integer" } }
    }
  },
  paths: {
    "/health": {
      get: { tags: ["Health"], summary: "Health check", responses: { "200": { description: "OK" } } }
    },
    "/health/db": {
      get: { tags: ["Health"], summary: "Database health check", responses: { "200": { description: "OK" } } }
    },
    "/global-roles": {
      get: { tags: ["Global Roles"], summary: "List global roles", responses: { "200": { description: "OK" } } },
      post: {
        tags: ["Global Roles"],
        summary: "Create global role",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "201": { description: "Created" } }
      }
    },
    "/global-roles/{id}": {
      get: {
        tags: ["Global Roles"],
        summary: "Get global role",
        parameters: [{ $ref: "#/components/parameters/Id" }],
        responses: { "200": { description: "OK" }, "404": { description: "Not found" } }
      },
      put: {
        tags: ["Global Roles"],
        summary: "Update global role",
        parameters: [{ $ref: "#/components/parameters/Id" }],
        responses: { "200": { description: "OK" } }
      },
      delete: {
        tags: ["Global Roles"],
        summary: "Delete global role",
        parameters: [{ $ref: "#/components/parameters/Id" }],
        responses: { "204": { description: "Deleted" } }
      }
    },
    "/users": {
      get: { tags: ["Users"], summary: "List users", responses: { "200": { description: "OK" } } },
      post: {
        tags: ["Users"],
        summary: "Create user (password hashed with bcrypt)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UserCreate" } } }
        },
        responses: { "201": { description: "Created" } }
      }
    },
    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user",
        parameters: [{ $ref: "#/components/parameters/Id" }],
        responses: { "200": { description: "OK" } }
      },
      put: {
        tags: ["Users"],
        summary: "Update user",
        parameters: [{ $ref: "#/components/parameters/Id" }],
        responses: { "200": { description: "OK" } }
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user",
        parameters: [{ $ref: "#/components/parameters/Id" }],
        responses: { "204": { description: "Deleted" } }
      }
    },
    "/users/{userId}/companies": {
      get: {
        tags: ["Users"],
        summary: "Get user with companies",
        parameters: [{ $ref: "#/components/parameters/UserId" }],
        responses: { "200": { description: "OK" } }
      }
    },
    "/statuses": {
      get: { tags: ["Statuses"], summary: "List statuses", responses: { "200": { description: "OK" } } },
      post: {
        tags: ["Statuses"],
        summary: "Create status",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/StatusCreate" } } }
        },
        responses: { "201": { description: "Created" } }
      }
    },
    "/statuses/{id}": {
      put: {
        tags: ["Statuses"],
        summary: "Update status (forbidden for id 1-7)",
        parameters: [{ $ref: "#/components/parameters/Id" }],
        responses: { "200": { description: "OK" }, "403": { description: "Predetermined status" } }
      },
      delete: {
        tags: ["Statuses"],
        summary: "Delete status (forbidden for id 1-7)",
        parameters: [{ $ref: "#/components/parameters/Id" }],
        responses: { "204": { description: "Deleted" }, "403": { description: "Predetermined status" } }
      }
    },
    "/projects": {
      get: { tags: ["Projects"], summary: "List projects", responses: { "200": { description: "OK" } } },
      post: {
        tags: ["Projects"],
        summary: "Create project",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectCreate" } } }
        },
        responses: { "201": { description: "Created" } }
      }
    },
    "/projects/with-status-mode": {
      post: {
        tags: ["Projects"],
        summary: "Create project and initialize default statuses",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectCreate" } } }
        },
        responses: { "201": { description: "Created with statuses" } }
      }
    },
    "/projects/{projectId}/board": {
      get: {
        tags: ["Project Scope"],
        summary: "Project board (statuses + tasks with filters)",
        parameters: [
          { $ref: "#/components/parameters/ProjectId" },
          { name: "search", in: "query", schema: { type: "string" }, description: "Search title, description, tags" },
          { name: "type", in: "query", schema: { $ref: "#/components/schemas/TaskType" } },
          { name: "status", in: "query", schema: { type: "integer" }, description: "Filter by statusId" }
        ],
        responses: { "200": { description: "Board with tasks, statuses, and blocker info" } }
      }
    },
    "/projects/{projectId}/statuses": {
      get: {
        tags: ["Project Scope"],
        summary: "List project statuses",
        parameters: [{ $ref: "#/components/parameters/ProjectId" }],
        responses: { "200": { description: "OK" } }
      },
      post: {
        tags: ["Project Scope"],
        summary: "Add custom status to project",
        parameters: [{ $ref: "#/components/parameters/ProjectId" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/StatusCreate" } } }
        },
        responses: { "201": { description: "Created" } }
      }
    },
    "/projects/{projectId}/statuses/{statusId}": {
      put: {
        tags: ["Project Scope"],
        summary: "Update project status (not id 1-7)",
        parameters: [
          { $ref: "#/components/parameters/ProjectId" },
          { $ref: "#/components/parameters/StatusId" }
        ],
        responses: { "200": { description: "OK" }, "403": { description: "Predetermined status" } }
      },
      delete: {
        tags: ["Project Scope"],
        summary: "Delete project status (not id 1-7)",
        parameters: [
          { $ref: "#/components/parameters/ProjectId" },
          { $ref: "#/components/parameters/StatusId" }
        ],
        responses: { "204": { description: "Deleted" }, "403": { description: "Predetermined status" } }
      }
    },
    "/projects/{projectId}/members": {
      get: {
        tags: ["Project Scope"],
        summary: "List project members",
        parameters: [{ $ref: "#/components/parameters/ProjectId" }],
        responses: { "200": { description: "OK" } }
      },
      post: {
        tags: ["Project Scope"],
        summary: "Add project member",
        parameters: [{ $ref: "#/components/parameters/ProjectId" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectMemberCreate" } } }
        },
        responses: { "201": { description: "Created" } }
      }
    },
    "/projects/{projectId}/members/{userId}": {
      delete: {
        tags: ["Project Scope"],
        summary: "Remove project member",
        parameters: [
          { $ref: "#/components/parameters/ProjectId" },
          { $ref: "#/components/parameters/UserId" }
        ],
        responses: { "204": { description: "Removed" } }
      }
    },
    "/projects/{projectId}/tasks": {
      get: {
        tags: ["Project Scope", "Tasks"],
        summary: "List project tasks",
        parameters: [{ $ref: "#/components/parameters/ProjectId" }],
        responses: { "200": { description: "OK" } }
      },
      post: {
        tags: ["Project Scope", "Tasks"],
        summary: "Create task in project",
        parameters: [{ $ref: "#/components/parameters/ProjectId" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectTaskCreate" } } }
        },
        responses: { "201": { description: "Created" } }
      }
    },
    "/projects/{projectId}/tasks/{taskId}": {
      get: {
        tags: ["Project Scope", "Tasks"],
        summary: "Get task in project",
        parameters: [
          { $ref: "#/components/parameters/ProjectId" },
          { $ref: "#/components/parameters/TaskId" }
        ],
        responses: { "200": { description: "OK" }, "404": { description: "Not found" } }
      },
      put: {
        tags: ["Project Scope", "Tasks"],
        summary: "Update task in project",
        parameters: [
          { $ref: "#/components/parameters/ProjectId" },
          { $ref: "#/components/parameters/TaskId" }
        ],
        responses: { "200": { description: "OK" } }
      },
      delete: {
        tags: ["Project Scope", "Tasks"],
        summary: "Delete task in project",
        parameters: [
          { $ref: "#/components/parameters/ProjectId" },
          { $ref: "#/components/parameters/TaskId" }
        ],
        responses: { "204": { description: "Deleted" } }
      }
    },
    "/projects/{projectId}/tasks/check-correctness": {
      post: {
        tags: ["Project Scope", "AI"],
        summary: "Check task relevance and assignee workload (AI optional via env)",
        parameters: [{ $ref: "#/components/parameters/ProjectId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/TaskCheckCorrectness" } }
          }
        },
        responses: { "200": { description: "Assignee load always; review when AI_TASK_CHECK enabled" } }
      }
    },
    "/projects/{projectId}/tasks/{taskId}/comments/summary": {
      get: {
        tags: ["Project Scope", "AI", "Comments"],
        summary: "Get comment summary (optional ?refresh=true when AI enabled)",
        parameters: [
          { $ref: "#/components/parameters/ProjectId" },
          { $ref: "#/components/parameters/TaskId" },
          { name: "refresh", in: "query", schema: { type: "boolean" } }
        ],
        responses: { "200": { description: "OK" } }
      },
      post: {
        tags: ["Project Scope", "AI", "Comments"],
        summary: "Regenerate comment summary (requires AI_COMMENT_SUMMARY)",
        parameters: [
          { $ref: "#/components/parameters/ProjectId" },
          { $ref: "#/components/parameters/TaskId" }
        ],
        responses: { "200": { description: "OK" }, "503": { description: "AI disabled or not configured" } }
      }
    },
    "/projects/{projectId}/tasks/{taskId}/comments": {
      get: {
        tags: ["Project Scope", "Comments"],
        summary: "List task comments",
        parameters: [
          { $ref: "#/components/parameters/ProjectId" },
          { $ref: "#/components/parameters/TaskId" }
        ],
        responses: { "200": { description: "OK" } }
      },
      post: {
        tags: ["Project Scope", "Comments"],
        summary: "Create task comment",
        parameters: [
          { $ref: "#/components/parameters/ProjectId" },
          { $ref: "#/components/parameters/TaskId" }
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectCommentCreate" } } }
        },
        responses: { "201": { description: "Created" } }
      }
    },
    "/tasks/search": {
      get: {
        tags: ["Tasks"],
        summary: "Search tasks",
        parameters: [
          { name: "q", in: "query", required: true, schema: { type: "string" } },
          { name: "projectId", in: "query", schema: { type: "integer" } },
          { name: "statusId", in: "query", schema: { type: "integer" } }
        ],
        responses: { "200": { description: "OK" } }
      }
    },
    "/tasks/{taskId}/details": {
      get: {
        tags: ["Tasks"],
        summary: "Task details with comments and roles",
        parameters: [{ $ref: "#/components/parameters/TaskId" }],
        responses: { "200": { description: "OK" } }
      }
    },
    "/companies/{companyId}/projects": {
      get: {
        tags: ["Companies"],
        summary: "Company with projects",
        parameters: [{ $ref: "#/components/parameters/CompanyId" }],
        responses: { "200": { description: "OK" } }
      }
    },
    "/users/{userId}/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "List user notifications",
        parameters: [
          { $ref: "#/components/parameters/UserId" },
          { name: "read", in: "query", schema: { type: "boolean" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
          { name: "offset", in: "query", schema: { type: "integer" } }
        ],
        responses: { "200": { description: "OK" } }
      }
    },
    "/users/{userId}/notifications/unread-count": {
      get: {
        tags: ["Notifications"],
        summary: "Unread notification count",
        parameters: [{ $ref: "#/components/parameters/UserId" }],
        responses: { "200": { description: "OK" } }
      }
    },
    "/users/{userId}/notifications/read-all": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark all notifications as read",
        parameters: [{ $ref: "#/components/parameters/UserId" }],
        responses: { "200": { description: "OK" } }
      }
    },
    "/users/{userId}/notifications/{id}/read": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark one notification as read",
        parameters: [{ $ref: "#/components/parameters/UserId" }, { $ref: "#/components/parameters/Id" }],
        responses: { "200": { description: "OK" } }
      }
    }
  }
} as const;
