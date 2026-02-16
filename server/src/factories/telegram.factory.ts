import { TelegramService } from '../services/telegram.service';
import { ITelegramServiceFactory } from './interfaces';

export class TelegramServiceFactory implements ITelegramServiceFactory {
    private instances = new Map<string, TelegramService>();

    getInstance(botToken: string): TelegramService {
        if (!this.instances.has(botToken)) {
            this.instances.set(botToken, new TelegramService(botToken));
        }
        return this.instances.get(botToken)!;
    }
}

export default new TelegramServiceFactory();
