import { Stream } from 'stream';
import telegramServiceFlyweight from '../flyweights/telegram.flyweight';
import { File, IFile } from '../models/file.model';
import { Folder, IFolder } from '../models/folder.model';
import ApiError from '../exceptions/api.error';
import { Types } from 'mongoose';
import filesObserver, { EventType } from '../observers/files.observer';
import { QueryBuilder } from '../builders/query.builder';
import { IFilesFacade } from './interfaces';

class FilesFacade implements IFilesFacade {
    async uploadFile(
        file: Express.Multer.File,
        ownerId: string,
        tgCredentials: { botToken: string; chatId: string },
        parentFolderId: string | null = null
    ) {
        const telegramService = telegramServiceFlyweight.getInstance(tgCredentials.botToken);

        const fileStream = Stream.Readable.from(file.buffer);

        try {
            const { messageId, fileId } = await telegramService.uploadFile(
                tgCredentials.chatId,
                fileStream,
                file.originalname
            );

            const newFile = await File.create({
                ownerId: new Types.ObjectId(ownerId),
                name: file.originalname,
                size: file.size,
                mimeType: file.mimetype,
                parentFolderId: parentFolderId ? new Types.ObjectId(parentFolderId) : null,
                telegramMessageId: messageId,
                telegramFileId: fileId,
            });

            filesObserver.emit(EventType.FILE_UPLOADED, newFile);

            return newFile;
        } catch (error: any) {
            console.error('File upload failed:', error);
            throw ApiError.BadRequest(error.message || 'File upload failed');
        }
    }

    async downloadFile(fileId: string, ownerId: string, tgCredentials: { botToken: string; chatId: string }) {
        const file = await File.findOne({ _id: fileId, ownerId });
        if (!file) {
            throw ApiError.NotFound('File not found');
        }

        if (!file.telegramFileId) {
            throw ApiError.BadRequest('File not uploaded to Telegram correctly');
        }

        const telegramService = telegramServiceFlyweight.getInstance(tgCredentials.botToken);
        const fileLink = await telegramService.getFileLink(file.telegramFileId);

        filesObserver.emit(EventType.FILE_DOWNLOADED, { fileId, ownerId });

        return {
            file,
            fileLink
        };
    }

    async getFileStreamWithMetadata(fileId: string, ownerId: string, tgCredentials: { botToken: string }) {
        const file = await File.findOne({ _id: fileId, ownerId });
        if (!file) {
            throw ApiError.NotFound('File not found');
        }

        if (!file.telegramFileId) {
            throw ApiError.BadRequest('File not uploaded to Telegram correctly');
        }

        const telegramService = telegramServiceFlyweight.getInstance(tgCredentials.botToken);
        const stream = await telegramService.getFileStream(file.telegramFileId);

        return {
            file,
            stream
        };
    }

    async renameFile(fileId: string, name: string, ownerId: string) {
        const file = await File.findOne({ _id: fileId, ownerId });
        if (!file) {
            throw ApiError.NotFound('File not found');
        }

        // Check for collisions in both files and folders
        const fileCollisionBuilder = new QueryBuilder<IFile>(File)
            .byOwner(ownerId)
            .inFolder(file.parentFolderId?.toString() || null)
            .withName(name)
            .excludeId(fileId);

        const collisionFile = await fileCollisionBuilder.findOne();

        const collisionFolder = await new QueryBuilder<IFolder>(Folder)
            .byOwner(ownerId)
            .inFolder(file.parentFolderId?.toString() || null)
            .withName(name)
            .findOne();

        if (collisionFile || collisionFolder) {
            throw ApiError.BadRequest('A file or folder with this name already exists in this directory');
        }

        const updatedFile = await File.findByIdAndUpdate(fileId, { name }, { new: true });

        filesObserver.emit(EventType.FILE_RENAMED, updatedFile);

        return updatedFile;
    }

    async moveFile(fileId: string, parentFolderId: string | null, ownerId: string) {
        const file = await File.findOne({ _id: fileId, ownerId });
        if (!file) {
            throw ApiError.NotFound('File not found');
        }

        const updatedFile = await File.findByIdAndUpdate(fileId, {
            parentFolderId: parentFolderId ? new Types.ObjectId(parentFolderId) : null
        }, { new: true });

        filesObserver.emit(EventType.FILE_MOVED, updatedFile);

        return updatedFile;
    }

    async deleteFile(fileId: string, ownerId: string, tgCredentials: { botToken: string; chatId: string }) {
        const file = await File.findOne({ _id: fileId, ownerId });
        if (!file) {
            throw ApiError.NotFound('File not found');
        }

        const telegramService = telegramServiceFlyweight.getInstance(tgCredentials.botToken);
        await telegramService.deleteMessage(tgCredentials.chatId, file.telegramMessageId);

        await File.deleteOne({ _id: fileId });

        filesObserver.emit(EventType.FILE_DELETED, { fileId, ownerId });

        return file;
    }
}


export default new FilesFacade();