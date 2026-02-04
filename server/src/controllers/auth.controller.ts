import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validationResult } from 'express-validator';
import ApiError from '../exceptions/api.error';

import authService from '../services/auth.service';

const registrationSchema = z.object({
    email: z.string(),
    password: z.string().min(8),
    botToken: z.string().min(1),
    chatId: z.string().min(1),
});
const loginSchema = z.object({
    email: z.string(),
    password: z.string().min(8),
});

class AuthController {
    async registration(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest("Validation error", errors.array().map(error => error.msg)));
            }
            const { email, password, botToken, chatId } = registrationSchema.parse(req.body);
            const adminData = await authService.registration(email, password, botToken, chatId);
            res.cookie('refreshToken', adminData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            return res.json(adminData);
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest("Validation error", errors.array().map(error => error.msg)));
            }
            const { email, password } = loginSchema.parse(req.body);
            const adminData = await authService.login(email, password);
            res.cookie('refreshToken', adminData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            return res.json(adminData);
        } catch (error) {
            next(error);
        }
    }
    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest("Validation error", errors.array().map(error => error.msg)));
            }
            const { refreshToken } = req.cookies;
            const token = await authService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (error) {
            next(error);
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest("Validation error", errors.array().map(error => error.msg)));
            }
            const { refreshToken } = req.cookies;
            const adminData = await authService.refresh(refreshToken);
            res.cookie('refreshToken', adminData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            return res.json(adminData);
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();