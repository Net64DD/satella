import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import http from "http";
import rateLimit from 'express-rate-limit';

import { NetworkLayer } from "./socket/network.layer";

import type { Session } from "./service/auth.service";

// Rest-Routes
import authRouter from "./rest-routes/auth.router";
import userRouter from "./rest-routes/user.router";
import cpakRouter from "./rest-routes/cpak.router";
import friendsRouter from "./rest-routes/friends.router";
import shortenerRouter from "./rest-routes/shortener.router";
import achievementsRouter from "./rest-routes/achievements.router";

// Network-Routes
import securityNetRouter from "./net-routes/security.router";
import securityRestRouter from "./rest-routes/security.router";

declare module "express-serve-static-core" {
  interface Request {
    session?: Session;
    token?: string;
    refreshToken?: string;
  }
}

const skip = (path: string) => {
  return (
    path.startsWith('/v1/security') ||
    path.startsWith('/v1/health') ||
    path === '/health'
  );
};

const startServer = async (port: number): Promise<NetworkLayer> => {
  const app = express();
  const server = http.createServer(app);
  const net = new NetworkLayer();

  // BEGIN: Express

  app.use(cors());
  app.use(morgan('dev', {
    skip: (req, _) => skip(req.path),
  }));
  app.use(express.json());
  app.use(express.static("assets"));
  app.use( // Resume the socket for raw TCP handling
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
  app.use("/v1/security", securityRestRouter);
  
  // Begin: Network
  net.use("/v1/security", securityNetRouter);
  
  net.start(port, (socket) => {
    server.emit('connection', socket);
  });

  return net;
};

export default startServer;
