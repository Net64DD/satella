import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from 'express-rate-limit';

import type { Session } from "./service/auth.service";

// Routes
import authRouter from "./routes/auth.router";
import userRouter from "./routes/user.router";
import cpakRouter from "./routes/cpak.router";
import friendsRouter from "./routes/friends.router";
import shortenerRouter from "./routes/shortener.router";
import achievementsRouter from "./routes/achievements.router";

declare module "express-serve-static-core" {
  interface Request {
    session?: Session;
    token?: string;
    refreshToken?: string;
  }
}

const skip = (path: string) => {
  return path.startsWith('/v1/security') || path.startsWith('/v1/health');
};

const startServer = async () => {
  const app = express();

  app.use(cors());
  app.use(morgan('dev', {
    skip: (req, _) => skip(req.path),
  }));
  app.use(express.json());
  app.use(express.static("assets"));
  app.use(
    helmet({
      strictTransportSecurity: {
        maxAge: 31536000,
        preload: true,
      },
    }),
  );
  app.use(rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 400,
      skip: (req, _) => skip(req.path),
      message: { error: 'Too many requests, please try again later.' }
  }));
  app.get('/health', (_, res) => {
    return res.status(200).json({ status: 'ok' });
  });

  app.use("/v1/auth", authRouter);
  app.use("/v1/user", userRouter);
  app.use("/v1/cpak", cpakRouter);
  app.use("/v1/friends", friendsRouter);
  app.use("/v1/discord", shortenerRouter);
  app.use("/v1/achievements", achievementsRouter);

  app.set("port", process.env.PORT || 8080);

  return app;
};

export default startServer;
