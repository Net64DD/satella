import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

import { Session } from './service/auth.service';

// Routes
import authRouter from './routes/auth.router';
import userRouter from './routes/user.router';
import friendsRouter from './routes/friends.router';
import shortenerRouter from './routes/shortener.router';

declare module "express-serve-static-core" {
  interface Request {
    session?: Session;
  }
}

const startServer = async () => {
    const app = express();

    app.use(cors());
    app.use(morgan('dev'));
    app.use(express.json());
    app.use(express.static('assets'));
    app.use(helmet({
        strictTransportSecurity: {
            maxAge: 31536000,
            preload: true
        },
    }));

    app.use('/v1/auth', authRouter);
    app.use('/v1/user', userRouter);
    app.use('/v1/friends', friendsRouter);
    app.use('/v1/discord', shortenerRouter);

    app.set('port', process.env.PORT || 8080);

    return app;
};

export default startServer;