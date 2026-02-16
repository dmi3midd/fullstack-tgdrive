import { Request, Response, NextFunction } from 'express';

import { User } from '../models/user.model';
import { UserDto } from '../dtos/user.dto';
import tokenUtil from '../utils/token.util';
import { config } from '../config/env.config';
import ApiError from '../exceptions/api.error';
import { createEncryptionContext } from '../strategies';

const encryptionContext = createEncryptionContext(config.encryptionStrategy);

export interface AuthRequest extends Request {
    user: UserDto;
    tgCredentials: {
        botToken: string;
        chatId: string;
    };
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token = '';
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.query.token) {
            token = req.query.token as string;
        }

        if (!token) {
            return next(ApiError.Unauthorized());
        }

        const payload = tokenUtil.validateAccessToken(token);

        const user = await User.findById(payload?.id);
        if (!user) {
            return next(ApiError.Unauthorized());
        }

        try {
            const botToken = encryptionContext.decrypt(user.encryptedBotToken, config.encryptionKey);
            const chatId = encryptionContext.decrypt(user.encryptedChatId, config.encryptionKey);

            if (!botToken || !chatId) {
                return next(ApiError.BadRequest('Telegram credentials are missing or corrupted'));
            }

            (req as AuthRequest).user = new UserDto(user);
            (req as AuthRequest).tgCredentials = { botToken, chatId };
        } catch (error) {
            return next(ApiError.BadRequest('Failed to decrypt Telegram credentials'));
        }

        next();
    } catch (error) {
        if (error instanceof ApiError) {
            return next(error);
        }
        next(ApiError.Unauthorized());
    }
};