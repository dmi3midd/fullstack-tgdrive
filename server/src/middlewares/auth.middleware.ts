import { Request, Response, NextFunction } from 'express';
import CryptoJS from 'crypto-js';

import { User } from '../models/user.model';
import { UserDto } from '../dtos/user.dto';
import tokenService from '../services/token.service';
import { config } from '../config/env.config';
import ApiError from '../exceptions/api.error';

export interface AuthRequest extends Request {
    user: UserDto;
    tgCredentials: {
        botToken: string;
        chatId: string;
    };
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(ApiError.Unauthorized());
        }

        const token = authHeader.split(' ')[1];
        const payload = tokenService.validateAccessToken(token);

        const user = await User.findById(payload?.id);
        if (!user) {
            return next(ApiError.Unauthorized());
        }

        (req as AuthRequest).user = new UserDto(user);
        (req as AuthRequest).tgCredentials = {
            botToken: CryptoJS.AES.decrypt(user.encryptedBotToken, config.encryptionKey).toString(CryptoJS.enc.Utf8),
            chatId: CryptoJS.AES.decrypt(user.encryptedChatId, config.encryptionKey).toString(CryptoJS.enc.Utf8),
        };

        next();
    } catch (error) {
        next(ApiError.Unauthorized());
    }
};