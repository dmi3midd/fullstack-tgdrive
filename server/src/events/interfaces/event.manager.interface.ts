import { EventType, EventHandler } from '../event.manager';

export interface IEventManager {
    on(event: EventType, handler: EventHandler): void;
    off(event: EventType, handler: EventHandler): void;
    emit(event: EventType, data: any): void;
}
