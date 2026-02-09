

import { Stream } from 'stream';
import multer from 'multer';
import { TelegramService } from './telegram.service';
import { File } from '../models/file.model';
import { Folder } from '../models/folder.model';
import ApiError from '../exceptions/api.error';
import { Types } from 'mongoose';

class FilesService {
    async uploadFile(
        file: Express.Multer.File,
        ownerId: string,
        tgCredentials: { botToken: string; chatId: string },
        parentFolderId: string | null = null
    ) {
        const telegramService = new TelegramService(tgCredentials.botToken);

        // Convert Buffer to Stream
        const fileStream = Stream.Readable.from(file.buffer);

        try {
            const { messageId, fileId } = await telegramService.uploadFile(
                tgCredentials.chatId,
                fileStream,
                file.originalname
            );

            const newFile = await File.create({
                ownerId,
                name: file.originalname,
                size: file.size,
                mimeType: file.mimetype,
                parentFolderId: parentFolderId || null,
                telegramMessageId: messageId,
                telegramFileId: fileId,
            });

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

        const telegramService = new TelegramService(tgCredentials.botToken);
        const fileLink = await telegramService.getFileLink(file.telegramFileId);

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

        const telegramService = new TelegramService(tgCredentials.botToken);
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
        const collisionFile = await File.findOne({
            ownerId,
            parentFolderId: file.parentFolderId,
            name,
            _id: { $ne: fileId }
        });

        const collisionFolder = await Folder.findOne({
            ownerId,
            parentFolderId: file.parentFolderId,
            name
        });

        if (collisionFile || collisionFolder) {
            throw ApiError.BadRequest('A file or folder with this name already exists in this directory');
        }

        file.name = name;
        await file.save();
        return file;
    }

    async moveFile(fileId: string, parentFolderId: string | null, ownerId: string) {
        const file = await File.findOne({ _id: fileId, ownerId });
        if (!file) {
            throw ApiError.NotFound('File not found');
        }

        file.parentFolderId = parentFolderId ? new Types.ObjectId(parentFolderId) : null;
        await file.save();
        return file;
    }

    async deleteFile(fileId: string, ownerId: string, tgCredentials: { botToken: string; chatId: string }) {
        const file = await File.findOne({ _id: fileId, ownerId });
        if (!file) {
            throw ApiError.NotFound('File not found');
        }

        const telegramService = new TelegramService(tgCredentials.botToken);
        await telegramService.deleteMessage(tgCredentials.chatId, file.telegramMessageId);

        await file.deleteOne();
        return file;
    }
}


export default new FilesService();