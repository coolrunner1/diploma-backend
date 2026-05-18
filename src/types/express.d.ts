import "express-serve-static-core";

declare global {
  namespace Express {
    interface Request {
      /** Set from `X-User-Id` header until auth middleware exists. */
      actorUserId?: number;
    }
  }
}

export {};
