import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { env } from "./config/env";
import apiRoutes from "./modules/index";
import { setupSwagger } from "./docs/swagger";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimit";

const app = express();

app.set("trust proxy", 1); // correct client IP behind a proxy (rate limiting)

// API docs are mounted before helmet/rate-limit so Swagger UI's bundled assets
// aren't blocked by the Content-Security-Policy and don't consume the API quota.
//   • /api/docs       → interactive Swagger UI
//   • /api/docs.json  → raw OpenAPI 3.0 spec
setupSwagger(app);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
if (!env.isProd) app.use(morgan("dev"));

app.use("/api", apiLimiter);

// Never let browsers cache API responses (prevents stale per-user list data).
app.use("/api", (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.get("/", (_req, res) =>
  res.json({ success: true, message: "Lokkho API", docs: "/api/docs" })
);

app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
