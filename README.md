# Task API

Express + TypeScript + Zod + Prisma API for the provided database schema.

## 1) Setup

1. Copy `.env.example` to `.env`
2. Set `DATABASE_URL`
3. Install dependencies:

```bash
npm install
```

## 2) Prisma

Generate Prisma client:

```bash
npm run prisma:generate
```

If your DB already exists with the same schema, pull into Prisma if needed:

```bash
npx prisma db pull
```

## 3) Run

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

## 4) Seed data

Run:

```bash
npm run db:seed
```

## 5) API

- Base path: `/api/v1`
- Health: `GET /api/v1/health`
- DB health: `GET /api/v1/health/db`
- CRUD routes:
  - `/api/v1/global-roles`
  - `/api/v1/project-roles`
  - `/api/v1/statuses`
  - `/api/v1/users`
  - `/api/v1/companies`
  - `/api/v1/projects`
  - `/api/v1/user-companies`
  - `/api/v1/project-users`
  - `/api/v1/user-role-in-projects`
  - `/api/v1/comments`
- Composite key routes:
  - `GET/POST /api/v1/project-statuses`
  - `DELETE /api/v1/project-statuses/:projectId/:statusId`
  - `GET/POST /api/v1/task-role-users`
  - `DELETE /api/v1/task-role-users/:userId/:taskId/:roleId`
- Extended relation/search routes:
  - `GET /api/v1/users/:userId/companies`
  - `GET /api/v1/companies/:companyId/projects`
  - `GET /api/v1/projects/:projectId/board`
  - `GET /api/v1/tasks/:taskId/details`
  - `GET /api/v1/tasks/search?q=<term>&projectId=<id>&statusId=<id>`
- Project-scoped security-oriented routes:
  - `POST /api/v1/projects/with-status-mode` (`editableStatuses`: `true` | `false`)
  - `GET/POST /api/v1/project/:projectId/statuses`
  - `GET/POST/DELETE /api/v1/project/:projectId/members`
  - `GET/POST /api/v1/project/:projectId/tasks`
  - `GET/PUT/DELETE /api/v1/project/:projectId/tasks/:taskId`
  - `GET/POST /api/v1/project/:projectId/tasks/:taskId/comments`

## Notes

- Your SQL has a few type/constraint inconsistencies (for example `Tasks.status_id` declared as `varchar` but references `Statuses.id` integer). In this API, relation columns are normalized to `Int` so foreign keys are valid.
- `Tasks.tags` is validated as JSON object with structure `{ uuid: string; title: string }`.
- Status strategy:
  - `editableStatuses: false`: project links shared default statuses (`To Do`, `In Progress`, `In Testing`, `Rejected`, `Done`)
  - `editableStatuses: true`: project gets its own new status rows initialized with the same defaults
