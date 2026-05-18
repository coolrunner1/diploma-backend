import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./openapi.js";

export const setupSwagger = (app: Express): void => {
  app.get("/api-docs.json", (_req, res) => {
    res.json(openApiDocument);
  });

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customSiteTitle: "Task API Docs",
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true
      }
    })
  );
};
