import cors from "cors";
import express from "express";
import path from "node:path";

import { env } from "./config/env";
import recipeRoutes from "./routes/recipeRoutes";

const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  "/uploads",
  express.static(
    path.resolve(process.cwd(), "uploads"),
  ),
);

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "RecipePeeker API is running.",
  });
});

app.use("/api/recipes", recipeRoutes);

app.use((_request, response) => {
  response.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

export default app;