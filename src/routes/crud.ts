import { Router } from "express";
import { ZodTypeAny } from "zod";
import { validateBody } from "../lib/validate.js";

type Delegate = any;

export type CrudOptions = {
  /** Assign a new uuid on create (client cannot set uuid). */
  generateUuid?: boolean;
  beforeCreate?: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
  beforeUpdate?: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
  canUpdate?: (id: number) => boolean | Promise<boolean>;
  canDelete?: (id: number) => boolean | Promise<boolean>;
  forbiddenMessage?: string;
};

export const makeCrudRouter = (
  delegate: Delegate,
  createSchema: ZodTypeAny,
  updateSchema: ZodTypeAny,
  options: CrudOptions = {}
) => {
  const router = Router();
  const forbiddenMessage = options.forbiddenMessage ?? "Operation not allowed for this resource";

  router.get("/", async (_req, res, next) => {
    try {
      const items = await delegate.findMany();
      res.json(items);
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const item = await delegate.findUnique({ where: { id } });

      if (!item) {
        res.status(404).json({ message: "Not found" });
        return;
      }

      res.json(item);
    } catch (error) {
      next(error);
    }
  });

  router.post("/", validateBody(createSchema), async (req, res, next) => {
    try {
      let data = { ...req.body } as Record<string, unknown>;
      delete data.uuid;

      if (options.beforeCreate) {
        data = await options.beforeCreate(data);
      }

      if (options.generateUuid) {
        const { withGeneratedUuid } = await import("../lib/uuid.js");
        data = withGeneratedUuid(data);
      }

      const created = await delegate.create({ data });
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", validateBody(updateSchema), async (req, res, next) => {
    try {
      const id = Number(req.params.id);

      if (options.canUpdate && !(await options.canUpdate(id))) {
        res.status(403).json({ message: forbiddenMessage });
        return;
      }

      let data = { ...req.body } as Record<string, unknown>;
      delete data.uuid;

      if (options.beforeUpdate) {
        data = await options.beforeUpdate(data);
      }

      const updated = await delegate.update({ where: { id }, data });
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      const id = Number(req.params.id);

      if (options.canDelete && !(await options.canDelete(id))) {
        res.status(403).json({ message: forbiddenMessage });
        return;
      }

      await delegate.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
};
