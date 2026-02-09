import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import { config } from './config/env.config';
import authRouter from './routers/auth.router';
import filesRouter from './routers/files.router';
import foldersRouter from './routers/folders.router';
import errorMiddleware from './middlewares/error.middleware';
import loggingSubscriber from './subscribers/logging.subscriber';

const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(helmet());
app.use(cors(
    {
        credentials: true,
        origin: config.frontendUrl
    }
));
app.use(limiter);

app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRouter);
app.use('/files', filesRouter);
app.use('/folders', foldersRouter);
app.use(errorMiddleware);

async function start() {
    try {
        await mongoose.connect(config.mongodbUrl);
        console.log('MongoDB connected');

        loggingSubscriber.init();

        app.listen(config.port, () => {
            console.log(`Server is running on port ${config.port}`);
        });
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}
start();