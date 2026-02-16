import { ITelegramService } from '../../services/interfaces';

export interface ITelegramServiceFactory {
    getInstance(botToken: string): ITelegramService;
}
