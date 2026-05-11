import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const requireProjectContext = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = Number(req.params.projectId);
    if (Number.isNaN(projectId)) {
      res.status(400).json({ message: "Invalid projectId" });
      return;
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Future auth middleware hook:
    // - resolve authenticated user from token/session
    // - verify membership/role in this project
    // - reject requests for unauthorized users
    next();
  } catch (error) {
    next(error);
  }
};
