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

- Health: `GET /health`
- DB health: `GET /health/db`
- CRUD routes:
  - `/api/global-roles`
  - `/api/project-roles`
  - `/api/statuses`
  - `/api/task-roles`
  - `/api/users`
  - `/api/companies`
  - `/api/projects`
  - `/api/user-companies`
  - `/api/project-users`
  - `/api/tasks`
  - `/api/user-role-in-projects`
  - `/api/comments`
- Composite key routes:
  - `GET/POST /api/project-statuses`
  - `DELETE /api/project-statuses/:projectId/:statusId`
  - `GET/POST /api/task-role-users`
  - `DELETE /api/task-role-users/:userId/:taskId/:roleId`
- Extended relation/search routes:
  - `GET /api/users/:userId/companies`
  - `GET /api/companies/:companyId/projects`
  - `GET /api/projects/:projectId/board`
  - `GET /api/tasks/:taskId/details`
  - `GET /api/tasks/search?q=<term>&projectId=<id>&statusId=<id>`

## Notes

- Your SQL has a few type/constraint inconsistencies (for example `Tasks.status_id` declared as `varchar` but references `Statuses.id` integer). In this API, relation columns are normalized to `Int` so foreign keys are valid.
