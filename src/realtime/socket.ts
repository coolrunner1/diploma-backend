import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import type { Notification } from "@prisma/client";

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
      credentials: true
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = Number(socket.handshake.query.userId);
    if (!Number.isNaN(userId) && userId > 0) {
      socket.join(userRoom(userId));
    }

    socket.on("subscribe", (payload: { userId?: number }) => {
      if (payload?.userId && payload.userId > 0) {
        socket.join(userRoom(payload.userId));
      }
    });
  });

  return io;
};

export const getIo = (): Server | null => io;

export const userRoom = (userId: number): string => `user:${userId}`;

export const emitNotification = (userId: number, notification: Notification): void => {
  io?.to(userRoom(userId)).emit("notification", notification);
};

export const emitUnreadCount = (userId: number, count: number): void => {
  io?.to(userRoom(userId)).emit("unread_count", { count });
};
