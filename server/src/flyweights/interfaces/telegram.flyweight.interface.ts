import { ITelegramAdapter } from '../../adapters/interfaces';

export interface ITelegramServiceFlyweight {
    getInstance(botToken: string): ITelegramAdapter;
}
