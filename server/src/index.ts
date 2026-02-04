import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import { config } from './config/env.config';
import authRouter from './routers/auth.router';
import errorMiddleware from './middlewares/error.middleware';

const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRouter);
app.use(errorMiddleware);

async function start() {
    try {
        await mongoose.connect(config.mongodbUrl);
        console.log('MongoDB connected');
        app.listen(config.port, () => {
            console.log(`Server is running on port ${config.port}`);
        });
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}
start();