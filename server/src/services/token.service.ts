import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { IToken, Token } from '../models/token.model';
import { config } from '../config/env.config';
import { UserDto } from '../dtos/user.dto';
import { ITokenService } from './interfaces';


const JWT_ACCESS_SECRET = config.jwtAccessSecret;
const JWT_REFRESH_SECRET = config.jwtRefreshSecret;
const JWT_ACCESS_EXPIRATION = config.jwtAccessExpiresIn;
const JWT_REFRESH_EXPIRATION = config.jwtRefreshExpiresIn;


class TokenService implements ITokenService {
    generateTokens(payload: UserDto): { accessToken: string; refreshToken: string } {
        const accessToken = jwt.sign(
            payload,
            JWT_ACCESS_SECRET,
            { expiresIn: JWT_ACCESS_EXPIRATION } as SignOptions
        );

        const refreshToken = jwt.sign(
            payload,
            JWT_REFRESH_SECRET,
            { expiresIn: JWT_REFRESH_EXPIRATION } as SignOptions
        );

        return {
            accessToken,
            refreshToken,
        }
    }

    validateAccessToken(token: string): UserDto | null {
        try {
            const userData = jwt.verify(token, JWT_ACCESS_SECRET);
            return userData as UserDto;
        } catch (error) {
            return null;
        }
    }

    validateRefreshToken(token: string): UserDto | null {
        try {
            const userData = jwt.verify(token, JWT_REFRESH_SECRET);
            return userData as UserDto;
        } catch (error) {
            return null;
        }
    }

    async findToken(refreshToken: string): Promise<IToken | null> {
        return Token.findOne({ refreshToken });
    }

    async saveToken(userId: string, refreshToken: string): Promise<IToken | undefined | null> {
        const token = await Token.findOne({ user: userId });
        if (token) {
            token.refreshToken = refreshToken;
            return token.save();
        }
        const newToken = await Token.create({ user: userId, refreshToken });
        return newToken;
    }

    async removeToken(refreshToken: string): Promise<any> {
        return await Token.deleteOne({ refreshToken });
    }
}

export default new TokenService();