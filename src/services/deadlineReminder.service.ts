import { notification_type } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { notificationDispatch } from "./notificationDispatch.js";

const hoursAhead = (): number => Number(process.env.DEADLINE_REMINDER_HOURS ?? 24);
const cooldownHours = (): number => Number(process.env.DEADLINE_REMINDER_COOLDOWN_HOURS ?? 23);

const wasRecentlyNotified = async (userId: number, taskId: number): Promise<boolean> => {
  const since = new Date(Date.now() - cooldownHours() * 60 * 60 * 1000);
  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      type: notification_type.task_deadline_approaching,
      createdAt: { gte: since },
      data: { path: ["taskId"], equals: taskId }
    },
    select: { id: true }
  });
  return existing !== null;
};

export const deadlineReminderService = {
  async processApproachingDeadlines(): Promise<number> {
    const now = new Date();
    const horizon = new Date(now.getTime() + hoursAhead() * 60 * 60 * 1000);

    const tasks = await prisma.task.findMany({
      where: {
        endTimestamp: { gt: now, lte: horizon },
        status: { final: false }
      },
      select: {
        id: true,
        title: true,
        userId: true,
        endTimestamp: true,
        projectId: true,
        project: { select: { title: true } },
        taskRoleUser: { select: { userId: true } }
      }
    });

    let sent = 0;

    for (const task of tasks) {
      const recipientIds = new Set<number>([task.userId, ...task.taskRoleUser.map((r) => r.userId)]);

      for (const userId of recipientIds) {
        if (await wasRecentlyNotified(userId, task.id)) {
          continue;
        }

        await notificationDispatch.deadlineApproaching({
          recipientId: userId,
          taskId: task.id,
          taskTitle: task.title,
          projectId: task.projectId,
          projectTitle: task.project.title,
          deadline: task.endTimestamp
        });
        sent += 1;
      }
    }

    return sent;
  }
};
