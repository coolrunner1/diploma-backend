import { notification_type, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { emitNotification, emitUnreadCount } from "../realtime/socket.js";

export type CreateNotificationInput = {
  userId: number;
  type: notification_type;
  title: string;
  message: string;
  data?: Prisma.InputJsonValue;
};

export const notificationService = {
  async create(input: CreateNotificationInput) {
    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        data: input.data ?? undefined
      }
    });

    emitNotification(input.userId, notification);
    const count = await this.unreadCount(input.userId);
    emitUnreadCount(input.userId, count);

    return notification;
  },

  async createMany(
    inputs: CreateNotificationInput[],
    options?: { skipActorId?: number }
  ) {
    const filtered = options?.skipActorId
      ? inputs.filter((n) => n.userId !== options.skipActorId)
      : inputs;

    if (filtered.length === 0) {
      return [];
    }

    const created = await Promise.all(filtered.map((input) => this.create(input)));
    return created;
  },

  list(userId: number, options?: { read?: boolean; limit?: number; offset?: number }) {
    const limit = Math.min(options?.limit ?? 50, 100);
    const offset = options?.offset ?? 0;

    return prisma.notification.findMany({
      where: {
        userId,
        ...(options?.read !== undefined ? { read: options.read } : {})
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset
    });
  },

  unreadCount(userId: number) {
    return prisma.notification.count({
      where: { userId, read: false }
    });
  },

  async markRead(id: number, userId: number) {
    const result = await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true }
    });
    if (result.count > 0) {
      emitUnreadCount(userId, await this.unreadCount(userId));
    }
    return result.count > 0;
  },

  async markAllRead(userId: number) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
    emitUnreadCount(userId, 0);
  },

  async remove(id: number, userId: number) {
    const result = await prisma.notification.deleteMany({
      where: { id, userId }
    });
    if (result.count > 0) {
      emitUnreadCount(userId, await this.unreadCount(userId));
    }
    return result.count > 0;
  }
};
