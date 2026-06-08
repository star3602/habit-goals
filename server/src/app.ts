import express from "express";
import cors from "cors";
import morgan from "morgan";
import { authRouter } from "./routes/auth.js";
import { goalsRouter } from "./routes/goals.js";

const defaultAllowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];

function getAllowedOrigins() {
  const configuredOrigins = process.env.CLIENT_ORIGIN?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? [];
  return configuredOrigins.length > 0 ? configuredOrigins : defaultAllowedOrigins;
}

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        const allowedOrigins = getAllowedOrigins();

        // curl、Postman、同源代理请求通常没有 Origin，直接放行。
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`CORS origin not allowed: ${origin}`));
      },
      credentials: true
    })
  );
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/goals", goalsRouter);

  app.use((_req, res) => {
    res.status(404).json({ message: "Route not found." });
  });

  return app;
}
