import { z } from "zod";

const string255 = z.string().min(1).max(255);
const optionalString255 = z.string().max(255).optional().nullable();
const isoDate = z.coerce.date();
const tagSchema = z.object({
  uuid: string255,
  title: string255
});

export const globalRoleCreate = z.object({
  title: string255,
  description: z.string().optional().nullable()
});
export const globalRoleUpdate = globalRoleCreate.partial();

export const projectRoleCreate = z.object({
  uuid: string255,
  title: string255,
  description: z.string().optional().nullable()
});
export const projectRoleUpdate = projectRoleCreate.partial();

export const statusCreate = z.object({
  uuid: string255,
  title: string255,
  description: z.string().optional().nullable(),
  position: z.number().int(),
  bgColor: string255,
  final: z.boolean()
});
export const statusUpdate = statusCreate.partial();

export const userCreate = z.object({
  uuid: string255,
  login: string255,
  password: string255,
  name: string255,
  surname: string255,
  bgColor: string255,
  email: z.string().email().max(255),
  globalRoleId: z.number().int(),
  createdAt: isoDate
});
export const userUpdate = userCreate.partial();

export const companyCreate = z.object({
  uuid: string255,
  name: string255,
  description: z.string().optional().nullable(),
  phoneNumber: optionalString255,
  email: z.string().email().max(255).optional().nullable(),
  ownerId: z.number().int()
});
export const companyUpdate = companyCreate.partial();

export const projectCreate = z.object({
  uuid: string255,
  title: string255,
  description: z.string().optional().nullable(),
  editableStatuses: z.boolean(),
  companyId: z.number().int(),
  startDate: isoDate.optional().nullable(),
  endDate: isoDate.optional().nullable()
});
export const projectUpdate = projectCreate.partial();

export const userCompanyCreate = z.object({
  userId: z.number().int(),
  companyId: z.number().int()
});
export const userCompanyUpdate = userCompanyCreate.partial();

export const projectUserCreate = z.object({
  projectId: z.number().int(),
  userId: z.number().int()
});
export const projectUserUpdate = projectUserCreate.partial();

export const taskCreate = z.object({
  uuid: string255,
  title: string255,
  description: z.string().min(1),
  commentSummary: string255,
  userId: z.number().int(),
  statusId: z.number().int(),
  messageCount: z.number().int(),
  projectId: z.number().int(),
  position: z.number().int(),
  tags: tagSchema,
  blockedBy: z.number().int(),
  startTimestamp: isoDate,
  endTimestamp: isoDate
});
export const taskUpdate = taskCreate.partial();

export const userRoleInProjectCreate = z.object({
  userId: z.number().int(),
  roleId: z.number().int(),
  projectId: z.number().int()
});
export const userRoleInProjectUpdate = userRoleInProjectCreate.partial();

export const commentCreate = z.object({
  userId: z.number().int(),
  taskId: z.number().int(),
  text: z.string().min(1)
});
export const commentUpdate = commentCreate.partial();
export const projectCommentCreate = z.object({
  userId: z.number().int(),
  text: z.string().min(1)
});

export const projectStatusCreate = z.object({
  projectId: z.number().int(),
  statusId: z.number().int()
});

export const taskRoleUserCreate = z.object({
  userId: z.number().int(),
  taskId: z.number().int(),
  roleId: z.number().int()
});

export const projectStatusCreateForProject = z.object({
  uuid: string255,
  title: string255,
  description: z.string().optional().nullable(),
  position: z.number().int(),
  bgColor: string255,
  final: z.boolean()
});

export const projectTaskCreate = taskCreate.omit({ projectId: true });
export const projectTaskUpdate = projectTaskCreate.partial();

export const projectMemberCreate = z.object({
  userId: z.number().int()
});
