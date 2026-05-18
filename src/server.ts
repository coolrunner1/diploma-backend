import { createServer } from "http";
import express from "express";
import cors from "cors";
import { apiRouter } from "./routes/index.js";
import { setupSwagger } from "./swagger/setup.js";
import { initSocket } from "./realtime/socket.js";
import { startDeadlineReminderJob } from "./jobs/deadlineReminders.js";
import { AiFeatureDisabledError, AiNotConfiguredError, AiProviderError } from "./errors/ai.js";

const app = express();
app.use(express.json());

const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";

app.use(
  cors({
    origin: corsOrigin,
    credentials: true
  })
);

setupSwagger(app);
app.use(apiRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (typeof error === "object" && error && "code" in error && error.code === "P2025") {
    res.status(404).json({ message: "Record not found" });
    return;
  }

  if (
    typeof error === "object" &&
    error &&
    "statusCode" in error &&
    (error as { statusCode: number }).statusCode === 403
  ) {
    res.status(403).json({
      message: error instanceof Error ? error.message : "Forbidden"
    });
    return;
  }

  if (error instanceof AiFeatureDisabledError || error instanceof AiNotConfiguredError) {
    res.status(error.statusCode).json({
      message: error.message,
      feature: error instanceof AiFeatureDisabledError ? error.feature : undefined
    });
    return;
  }

  if (error instanceof AiProviderError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

const port = Number(process.env.PORT ?? 3000);
const httpServer = createServer(app);

initSocket(httpServer);

httpServer.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api-docs`);
  console.log(`WebSocket: connect with query ?userId=<id>`);
  startDeadlineReminderJob();
});
