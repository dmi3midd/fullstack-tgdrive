import eventManager, { EventType } from '../events/event.manager';
import { logger } from '../config/logger.config';

class LoggingSubscriber {
    init() {
        logger.info('LoggingSubscriber initialized');

        eventManager.on(EventType.FILE_UPLOADED, (data) => {
            logger.info({ fileId: data._id, name: data.name }, '📝 FILE UPLOADED');
        });

        eventManager.on(EventType.FILE_DOWNLOADED, (data) => {
            logger.info({ fileId: data.fileId }, '📝 FILE DOWNLOADED');
        });

        eventManager.on(EventType.FILE_RENAMED, (data) => {
            logger.info({ fileId: data._id, newName: data.name }, '📝 FILE RENAMED');
        });

        eventManager.on(EventType.FILE_MOVED, (data) => {
            logger.info({ fileId: data._id, parentFolderId: data.parentFolderId }, '📝 FILE MOVED');
        });

        eventManager.on(EventType.FILE_DELETED, (data) => {
            logger.info({ fileId: data.fileId }, '📝 FILE DELETED');
        });

        eventManager.on(EventType.FOLDER_CREATED, (data) => {
            logger.info({ folderId: data._id, name: data.name }, '📝 FOLDER CREATED');
        });

        eventManager.on(EventType.FOLDER_RENAMED, (data) => {
            logger.info({ folderId: data._id, newName: data.name }, '📝 FOLDER RENAMED');
        });

        eventManager.on(EventType.FOLDER_MOVED, (data) => {
            logger.info({ folderId: data._id, parentFolderId: data.parentFolderId }, '📝 FOLDER MOVED');
        });

        eventManager.on(EventType.FOLDER_DELETED, (data) => {
            logger.info({ folderId: data.folderId }, '📝 FOLDER DELETED');
        });
    }
}

export default new LoggingSubscriber();
