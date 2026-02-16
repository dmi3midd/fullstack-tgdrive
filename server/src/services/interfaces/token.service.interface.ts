import { IToken } from '../../models/token.model';
import { UserDto } from '../../dtos/user.dto';

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface ITokenService {
    generateTokens(payload: UserDto): TokenPair;
    validateAccessToken(token: string): UserDto | null;
    validateRefreshToken(token: string): UserDto | null;
    findToken(refreshToken: string): Promise<IToken | null>;
    saveToken(userId: string, refreshToken: string): Promise<IToken | undefined | null>;
    removeToken(refreshToken: string): Promise<any>;
}
