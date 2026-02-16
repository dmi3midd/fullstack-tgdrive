import { IEventManager } from './interfaces';

export enum EventType {
    FILE_UPLOADED = 'FILE_UPLOADED',
    FILE_DOWNLOADED = 'FILE_DOWNLOADED',
    FILE_RENAMED = 'FILE_RENAMED',
    FILE_MOVED = 'FILE_MOVED',
    FILE_DELETED = 'FILE_DELETED',
    FOLDER_CREATED = 'FOLDER_CREATED',
    FOLDER_RENAMED = 'FOLDER_RENAMED',
    FOLDER_MOVED = 'FOLDER_MOVED',
    FOLDER_DELETED = 'FOLDER_DELETED',
}

export type EventHandler = (data: any) => void;

class EventManager implements IEventManager {
    private static instance: EventManager;
    private listeners: Map<EventType, EventHandler[]> = new Map();

    private constructor() { }

    static getInstance(): EventManager {
        if (!EventManager.instance) {
            EventManager.instance = new EventManager();
        }
        return EventManager.instance;
    }

    on(event: EventType, handler: EventHandler): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(handler);
    }

    off(event: EventType, handler: EventHandler): void {
        if (!this.listeners.has(event)) return;
        const handlers = this.listeners.get(event)!;
        this.listeners.set(
            event,
            handlers.filter((h) => h !== handler)
        );
    }

    emit(event: EventType, data: any): void {
        if (!this.listeners.has(event)) return;
        this.listeners.get(event)!.forEach((handler) => {
            try {
                handler(data);
            } catch (error) {
                console.error(`Error in event handler for ${event}:`, error);
            }
        });
    }
}

export default EventManager.getInstance();
