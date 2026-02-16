import { UserDto } from '../../dtos/user.dto';

export interface AuthTokensResponse {
    accessToken: string;
    refreshToken: string;
    user: UserDto;
}

export interface IAuthFacade {
    registration(email: string, password: string, botToken: string, chatId: string): Promise<AuthTokensResponse>;
    login(email: string, password: string): Promise<AuthTokensResponse>;
    logout(refreshToken: string): Promise<any>;
    refresh(refreshToken: string): Promise<AuthTokensResponse>;
}
