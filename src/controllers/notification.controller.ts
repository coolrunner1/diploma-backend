import { NextFunction, Request, Response } from "express";
import { notificationService } from "../services/notification.service.js";

export const listUserNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = Number(req.params.userId);
    const read =
      req.query.read === "true" ? true : req.query.read === "false" ? false : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const offset = req.query.offset ? Number(req.query.offset) : undefined;

    const notifications = await notificationService.list(userId, { read, limit, offset });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = Number(req.params.userId);
    const count = await notificationService.unreadCount(userId);
    res.json({ count });
  } catch (error) {
    next(error);
  }
};

export const markNotificationReadForUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const userId = Number(req.params.userId);
    const ok = await notificationService.markRead(id, userId);
    if (!ok) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const userId = Number(req.query.userId ?? req.body?.userId);
    if (Number.isNaN(userId)) {
      res.status(400).json({ message: "userId query or body field is required" });
      return;
    }

    const ok = await notificationService.markRead(id, userId);
    if (!ok) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = Number(req.params.userId);
    await notificationService.markAllRead(userId);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const userId = Number(req.query.userId ?? req.body?.userId);
    if (Number.isNaN(userId)) {
      res.status(400).json({ message: "userId query or body field is required" });
      return;
    }

    const ok = await notificationService.remove(id, userId);
    if (!ok) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
