import { TelegramAdapter } from '../adapters/telegram.adapter';
import { ITelegramServiceFlyweight } from './interfaces';

export class TelegramServiceFlyweight implements ITelegramServiceFlyweight {
    private instances = new Map<string, TelegramAdapter>();

    getInstance(botToken: string): TelegramAdapter {
        if (!this.instances.has(botToken)) {
            this.instances.set(botToken, new TelegramAdapter(botToken));
        }
        return this.instances.get(botToken)!;
    }
}

export default new TelegramServiceFlyweight();
