import { config } from "./utils/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { errorHandler, uncaughtExceptionHandler } from "./utils/middleware/errorHandler";
import { deserializeUser } from "./utils/middleware/deserializeUser";
import rateLimiter from "./utils/middleware/rateLimit";
import { userRequired } from "./utils/middleware/roleCheck";

import authRouter from "./router/authRouter";

const app = express();

app.set('trust proxy', 1);
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cors({
    origin: config.F_URL,
    credentials: true
}));

app.use(deserializeUser)

app.all('/', (_req: Request, res: Response) => {
    res.status(200).json({
        Status: 'OK',
        RunTime: process.uptime(),
    });
});
app.use('/api/auth', rateLimiter, authRouter)


process.on('unhandledRejection', uncaughtExceptionHandler);
process.on('uncaughtException', uncaughtExceptionHandler);

// this will handle all the errors
app.use(errorHandler);

// for starting the server
app.listen(config.PORT, () => {
    console.log(`Start on ${config.PORT} ✅`)
})