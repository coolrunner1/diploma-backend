import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear child/join tables first to satisfy foreign keys.
  await prisma.taskRoleUser.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.userRoleInProject.deleteMany();
  await prisma.projectStatus.deleteMany();
  await prisma.projectUser.deleteMany();
  await prisma.userCompany.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();
  await prisma.taskRole.deleteMany();
  await prisma.status.deleteMany();
  await prisma.projectRole.deleteMany();
  await prisma.globalRole.deleteMany();

  await prisma.globalRole.createMany({
    data: [
      { id: 1, name: "SuperAdmin", description: "System administrator" },
      { id: 2, name: "Manager", description: "Company manager" },
      { id: 3, name: "Member", description: "Regular member" }
    ]
  });

  await prisma.projectRole.createMany({
    data: [
      { id: 1, name: "Product Owner", description: "Defines requirements" },
      { id: 2, name: "Developer", description: "Implements tasks" },
      { id: 3, name: "QA", description: "Validates delivery" }
    ]
  });

  await prisma.taskRole.createMany({
    data: [
      { id: 1, name: "Assignee", description: "Main executor" },
      { id: 2, name: "Reviewer", description: "Reviews changes" },
      { id: 3, name: "Watcher", description: "Tracks progress" }
    ]
  });

  await prisma.status.createMany({
    data: [
      { id: 1, name: "Backlog", description: "Waiting", position: 1 },
      { id: 2, name: "In Progress", description: "Active work", position: 2 },
      { id: 3, name: "Review", description: "Under review", position: 3 },
      { id: 4, name: "Done", description: "Completed", position: 4 }
    ]
  });

  await prisma.user.createMany({
    data: [
      {
        id: 1,
        login: "admin",
        password: "admin123",
        email: "admin@example.com",
        globalRoleId: 1,
        createdAt: new Date("2026-01-01T10:00:00.000Z")
      },
      {
        id: 2,
        login: "alice",
        password: "alice123",
        email: "alice@example.com",
        globalRoleId: 2,
        createdAt: new Date("2026-01-02T10:00:00.000Z")
      },
      {
        id: 3,
        login: "bob",
        password: "bob123",
        email: "bob@example.com",
        globalRoleId: 3,
        createdAt: new Date("2026-01-03T10:00:00.000Z")
      },
      {
        id: 4,
        login: "carol",
        password: "carol123",
        email: "carol@example.com",
        globalRoleId: 3,
        createdAt: new Date("2026-01-04T10:00:00.000Z")
      }
    ]
  });

  await prisma.company.createMany({
    data: [
      {
        id: 1,
        name: "Acme Corp",
        description: "Main customer",
        phoneNumber: "+1-555-1111",
        email: "info@acme.example",
        ownerId: 2
      },
      {
        id: 2,
        name: "Globex",
        description: "Second customer",
        phoneNumber: "+1-555-2222",
        email: "hello@globex.example",
        ownerId: 1
      }
    ]
  });

  await prisma.project.createMany({
    data: [
      {
        id: 1,
        name: "Task Platform API",
        description: "Backend for task management",
        companyId: 1,
        startDate: new Date("2026-01-10"),
        endDate: new Date("2026-07-30")
      },
      {
        id: 2,
        name: "Client Dashboard",
        description: "Frontend dashboard",
        companyId: 1,
        startDate: new Date("2026-02-01"),
        endDate: null
      },
      {
        id: 3,
        name: "Internal Ops",
        description: "Automation tools",
        companyId: 2,
        startDate: new Date("2026-03-01"),
        endDate: null
      }
    ]
  });

  await prisma.userCompany.createMany({
    data: [
      { id: 1, userId: 1, companyId: 1 },
      { id: 2, userId: 2, companyId: 1 },
      { id: 3, userId: 3, companyId: 1 },
      { id: 4, userId: 1, companyId: 2 },
      { id: 5, userId: 4, companyId: 2 }
    ]
  });

  await prisma.projectUser.createMany({
    data: [
      { id: 1, projectId: 1, userId: 2 },
      { id: 2, projectId: 1, userId: 3 },
      { id: 3, projectId: 2, userId: 2 },
      { id: 4, projectId: 2, userId: 4 },
      { id: 5, projectId: 3, userId: 1 },
      { id: 6, projectId: 3, userId: 4 }
    ]
  });

  await prisma.projectStatus.createMany({
    data: [
      { projectId: 1, statusId: 1 },
      { projectId: 1, statusId: 2 },
      { projectId: 1, statusId: 3 },
      { projectId: 1, statusId: 4 },
      { projectId: 2, statusId: 1 },
      { projectId: 2, statusId: 2 },
      { projectId: 2, statusId: 4 },
      { projectId: 3, statusId: 1 },
      { projectId: 3, statusId: 2 },
      { projectId: 3, statusId: 4 }
    ]
  });

  await prisma.userRoleInProject.createMany({
    data: [
      { id: 1, userId: 2, roleId: 1, projectId: 1 },
      { id: 2, userId: 3, roleId: 2, projectId: 1 },
      { id: 3, userId: 2, roleId: 1, projectId: 2 },
      { id: 4, userId: 4, roleId: 3, projectId: 2 },
      { id: 5, userId: 1, roleId: 1, projectId: 3 },
      { id: 6, userId: 4, roleId: 2, projectId: 3 }
    ]
  });

  await prisma.task.createMany({
    data: [
      {
        id: 1,
        name: "Design DB schema",
        description: "Prepare relational schema for MVP",
        commentSummary: "Initial schema draft",
        userId: 2,
        statusId: 4,
        messageCount: 2,
        projectId: 1,
        position: 1,
        blockedBy: 0,
        startTimestamp: new Date("2026-01-11T09:00:00.000Z"),
        endTimestamp: new Date("2026-01-12T18:00:00.000Z")
      },
      {
        id: 2,
        name: "Implement auth endpoints",
        description: "Build login and role checks",
        commentSummary: "Auth in progress",
        userId: 3,
        statusId: 2,
        messageCount: 3,
        projectId: 1,
        position: 2,
        blockedBy: 1,
        startTimestamp: new Date("2026-01-13T09:00:00.000Z"),
        endTimestamp: new Date("2026-01-20T18:00:00.000Z")
      },
      {
        id: 3,
        name: "Create dashboard layout",
        description: "Build initial UI skeleton",
        commentSummary: "Awaiting review",
        userId: 4,
        statusId: 3,
        messageCount: 1,
        projectId: 2,
        position: 1,
        blockedBy: 0,
        startTimestamp: new Date("2026-02-02T10:00:00.000Z"),
        endTimestamp: new Date("2026-02-05T18:00:00.000Z")
      },
      {
        id: 4,
        name: "Set up CI pipeline",
        description: "Automate build and tests",
        commentSummary: "CI configured",
        userId: 1,
        statusId: 4,
        messageCount: 2,
        projectId: 3,
        position: 1,
        blockedBy: 0,
        startTimestamp: new Date("2026-03-02T09:00:00.000Z"),
        endTimestamp: new Date("2026-03-04T17:00:00.000Z")
      }
    ]
  });

  await prisma.comment.createMany({
    data: [
      { id: 1, userId: 2, taskId: 1, text: "Schema reviewed and approved." },
      { id: 2, userId: 1, taskId: 2, text: "Please add refresh tokens." },
      { id: 3, userId: 3, taskId: 2, text: "Will add in the next commit." },
      { id: 4, userId: 4, taskId: 3, text: "Layout ready for QA." },
      { id: 5, userId: 1, taskId: 4, text: "Pipeline passes on main." }
    ]
  });

  await prisma.taskRoleUser.createMany({
    data: [
      { userId: 2, taskId: 1, roleId: 1 },
      { userId: 1, taskId: 1, roleId: 2 },
      { userId: 3, taskId: 2, roleId: 1 },
      { userId: 1, taskId: 2, roleId: 2 },
      { userId: 4, taskId: 3, roleId: 1 },
      { userId: 2, taskId: 3, roleId: 2 },
      { userId: 1, taskId: 4, roleId: 1 }
    ]
  });

  console.log("Database seeded successfully.");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
