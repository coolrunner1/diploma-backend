import { NextFunction, Request, Response } from "express";

/** Resolves the acting user from `X-User-Id` (temporary until JWT auth). */
export const resolveActor = (req: Request, _res: Response, next: NextFunction): void => {
  const raw = req.headers["x-user-id"];
  if (raw !== undefined && raw !== "") {
    const id = Number(Array.isArray(raw) ? raw[0] : raw);
    if (!Number.isNaN(id)) {
      req.actorUserId = id;
    }
  }
  next();
};
