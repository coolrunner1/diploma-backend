import { notification_type } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { notificationService } from "./notification.service.js";

const skipSelf = (userId: number, actorUserId?: number) =>
  actorUserId !== undefined && userId === actorUserId;

export const notificationDispatch = {
  async taskAssigned(params: {
    assigneeId: number;
    taskId: number;
    taskTitle: string;
    projectId: number;
    projectTitle: string;
    actorUserId?: number;
  }) {
    if (skipSelf(params.assigneeId, params.actorUserId)) return;

    const actor = params.actorUserId
      ? await prisma.user.findUnique({ where: { id: params.actorUserId }, select: { name: true, surname: true } })
      : null;
    const actorName = actor ? `${actor.name} ${actor.surname}` : "Someone";

    await notificationService.create({
      userId: params.assigneeId,
      type: notification_type.task_assigned,
      title: "Task assigned",
      message: `${actorName} assigned you to "${params.taskTitle}" in ${params.projectTitle}`,
      data: {
        projectId: params.projectId,
        taskId: params.taskId
      }
    });
  },

  async taskComment(params: {
    recipientId: number;
    taskId: number;
    taskTitle: string;
    projectId: number;
    commentId: number;
    actorUserId: number;
  }) {
    if (skipSelf(params.recipientId, params.actorUserId)) return;

    const actor = await prisma.user.findUnique({
      where: { id: params.actorUserId },
      select: { name: true, surname: true }
    });
    const actorName = actor ? `${actor.name} ${actor.surname}` : "Someone";

    await notificationService.create({
      userId: params.recipientId,
      type: notification_type.task_comment,
      title: "New comment",
      message: `${actorName} commented on "${params.taskTitle}"`,
      data: {
        projectId: params.projectId,
        taskId: params.taskId,
        commentId: params.commentId
      }
    });
  },

  async taskStatusChanged(params: {
    recipientId: number;
    taskId: number;
    taskTitle: string;
    projectId: number;
    statusTitle: string;
    actorUserId?: number;
  }) {
    if (skipSelf(params.recipientId, params.actorUserId)) return;

    await notificationService.create({
      userId: params.recipientId,
      type: notification_type.task_status_changed,
      title: "Task status updated",
      message: `"${params.taskTitle}" moved to ${params.statusTitle}`,
      data: {
        projectId: params.projectId,
        taskId: params.taskId,
        statusTitle: params.statusTitle
      }
    });
  },

  async taskBlocked(params: {
    recipientId: number;
    taskId: number;
    taskTitle: string;
    projectId: number;
    blockerTaskId: number;
    blockerTitle: string;
    actorUserId?: number;
  }) {
    if (skipSelf(params.recipientId, params.actorUserId)) return;

    await notificationService.create({
      userId: params.recipientId,
      type: notification_type.task_blocked,
      title: "Task blocked",
      message: `"${params.taskTitle}" is blocked by "${params.blockerTitle}"`,
      data: {
        projectId: params.projectId,
        taskId: params.taskId,
        blockedBy: params.blockerTaskId
      }
    });
  },

  async deadlineApproaching(params: {
    recipientId: number;
    taskId: number;
    taskTitle: string;
    projectId: number;
    projectTitle: string;
    deadline: Date;
  }) {
    const deadlineLabel = params.deadline.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    });

    await notificationService.create({
      userId: params.recipientId,
      type: notification_type.task_deadline_approaching,
      title: "Deadline approaching",
      message: `"${params.taskTitle}" in ${params.projectTitle} is due ${deadlineLabel}`,
      data: {
        projectId: params.projectId,
        taskId: params.taskId,
        deadline: params.deadline.toISOString()
      }
    });
  },

  async projectMemberAdded(params: {
    memberId: number;
    projectId: number;
    projectTitle: string;
    actorUserId?: number;
  }) {
    if (skipSelf(params.memberId, params.actorUserId)) return;

    const actor = params.actorUserId
      ? await prisma.user.findUnique({ where: { id: params.actorUserId }, select: { name: true, surname: true } })
      : null;
    const actorName = actor ? `${actor.name} ${actor.surname}` : "Someone";

    await notificationService.create({
      userId: params.memberId,
      type: notification_type.project_member_added,
      title: "Added to project",
      message: `${actorName} added you to project "${params.projectTitle}"`,
      data: { projectId: params.projectId }
    });
  }
};
