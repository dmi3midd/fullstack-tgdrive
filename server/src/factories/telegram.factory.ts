import { TelegramService } from '../services/telegram.service';

export class TelegramServiceFactory {
    private static instances = new Map<string, TelegramService>();

    static getInstance(botToken: string): TelegramService {
        if (!this.instances.has(botToken)) {
            this.instances.set(botToken, new TelegramService(botToken));
        }
        return this.instances.get(botToken)!;
    }
}
