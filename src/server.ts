import express from "express";
import { apiRouter } from "./routes/index.js";

const app = express();
app.use(express.json());

app.use(apiRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (typeof error === "object" && error && "code" in error && error.code === "P2025") {
    res.status(404).json({ message: "Record not found" });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
