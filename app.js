import path from "node:path";
import { fileURLToPath } from "node:url";

import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import errorHandler from "./common/errors/errorHandler.js";
import notFound from "./common/errors/notFound.js";
import { env } from "./config/env.js";
import routes from "./features/index.js";

const app = express();
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const allowedOrigins = new Set(env.ALLOWED_ORIGINS);

app.disable("x-powered-by");
app.set("trust proxy", env.TRUST_PROXY);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(Object.assign(new Error("Origin is not allowed by CORS"), { statusCode: 403 }));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser(env.COOKIE_SECRET));
for (const publicFolder of ["media", "thumbnails", "profile_pics"]) {
  app.use(
    `/uploads/${publicFolder}`,
    express.static(path.join(currentDirectory, "public", "uploads", publicFolder), {
    dotfiles: "deny",
    fallthrough: false,
    index: false,
    maxAge: env.NODE_ENV === "production" ? "1d" : 0,
    }),
  );
}

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is healthy" });
});

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

export default app;
