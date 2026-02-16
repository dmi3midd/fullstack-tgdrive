import { EventType, EventHandler } from '../files.observer';

export interface IFilesObserver {
    on(event: EventType, handler: EventHandler): void;
    off(event: EventType, handler: EventHandler): void;
    emit(event: EventType, data: any): void;
}
