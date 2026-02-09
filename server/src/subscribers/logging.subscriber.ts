import eventManager, { EventType } from '../events/event.manager';

class LoggingSubscriber {
    init() {
        console.log('LoggingSubscriber initialized');

        eventManager.on(EventType.FILE_UPLOADED, (data) => {
            console.log('📝 [LOG] FILE UPLOADED:', data.name || data._id);
        });

        eventManager.on(EventType.FILE_DOWNLOADED, (data) => {
            console.log('📝 [LOG] FILE DOWNLOADED:', data.fileId);
        });

        eventManager.on(EventType.FILE_RENAMED, (data) => {
            console.log('📝 [LOG] FILE RENAMED:', data.name);
        });

        eventManager.on(EventType.FILE_MOVED, (data) => {
            console.log('📝 [LOG] FILE MOVED:', data._id);
        });

        eventManager.on(EventType.FILE_DELETED, (data) => {
            console.log('📝 [LOG] FILE DELETED:', data.fileId);
        });

        eventManager.on(EventType.FOLDER_CREATED, (data) => {
            console.log('📝 [LOG] FOLDER CREATED:', data.name);
        });

        eventManager.on(EventType.FOLDER_RENAMED, (data) => {
            console.log('📝 [LOG] FOLDER RENAMED:', data.name);
        });

        eventManager.on(EventType.FOLDER_MOVED, (data) => {
            console.log('📝 [LOG] FOLDER MOVED:', data._id);
        });

        eventManager.on(EventType.FOLDER_DELETED, (data) => {
            console.log('📝 [LOG] FOLDER DELETED:', data.folderId);
        });
    }
}

export default new LoggingSubscriber();
