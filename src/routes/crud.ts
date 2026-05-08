import { Router } from "express";
import { ZodTypeAny } from "zod";
import { validateBody } from "../lib/validate.js";

type Delegate = any;

export const makeCrudRouter = (delegate: Delegate, createSchema: ZodTypeAny, updateSchema: ZodTypeAny) => {
  const router = Router();

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
      const created = await delegate.create({ data: req.body });
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", validateBody(updateSchema), async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const updated = await delegate.update({ where: { id }, data: req.body });
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      await delegate.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
};
