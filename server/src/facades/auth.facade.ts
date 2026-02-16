import bcrypt from 'bcrypt';

import { config } from '../config/env.config';
import { User } from "../models/user.model";
import { UserDto } from '../dtos/user.dto';
import tokenUtil from '../utils/token.util';
import ApiError from '../exceptions/api.error';
import { IAuthFacade } from './interfaces';
import { createEncryptionContext } from '../strategies';

const encryptionContext = createEncryptionContext(config.encryptionStrategy);

class AuthFacade implements IAuthFacade {
    async registration(email: string, password: string, botToken: string, chatId: string) {
        const candidate = await User.findOne({ email });
        if (candidate) {
            throw ApiError.BadRequest('User already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const encryptedBotToken = encryptionContext.encrypt(botToken, config.encryptionKey);
        const encryptedChatId = encryptionContext.encrypt(chatId, config.encryptionKey);
        const user = await User.create({ email, passwordHash: hashedPassword, encryptedBotToken, encryptedChatId });
        const userDto = new UserDto(user);
        const tokens = tokenUtil.generateTokens({ ...userDto });
        await tokenUtil.saveToken(userDto.id, tokens.refreshToken);
        return {
            ...tokens,
            user: userDto,
        }
    }

    async login(email: string, password: string) {
        const user = await User.findOne({ email });
        if (!user) {
            throw ApiError.NotFound('User not found');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw ApiError.BadRequest('Invalid password');
        }
        const userDto = new UserDto(user);
        const tokens = tokenUtil.generateTokens({ ...userDto });
        await tokenUtil.saveToken(userDto.id, tokens.refreshToken);
        return {
            ...tokens,
            user: userDto,
        }
    }

    async logout(refreshToken: string) {
        const token = await tokenUtil.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken: string) {
        if (!refreshToken) {
            throw ApiError.Unauthorized();
        }
        const userData = tokenUtil.validateRefreshToken(refreshToken);
        const foundToken = await tokenUtil.findToken(refreshToken);
        if (!userData || !foundToken) {
            throw ApiError.Unauthorized();
        }
        const user = await User.findById(userData.id);
        if (!user) {
            throw ApiError.NotFound('User not found');
        }
        const userDto = new UserDto(user);
        const tokens = tokenUtil.generateTokens({ ...userDto });
        await tokenUtil.saveToken(userDto.id, tokens.refreshToken);
        return {
            ...tokens,
            user: userDto,
        }
    }
}

export default new AuthFacade();