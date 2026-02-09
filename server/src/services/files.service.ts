


import { Stream } from 'stream';
import { TelegramServiceFactory } from '../factories/telegram.factory';
import fileRepository from '../repositories/file.repository';
import folderRepository from '../repositories/folder.repository';
import ApiError from '../exceptions/api.error';
import { Types } from 'mongoose';

class FilesService {
    async uploadFile(
        file: Express.Multer.File,
        ownerId: string,
        tgCredentials: { botToken: string; chatId: string },
        parentFolderId: string | null = null
    ) {
        const telegramService = TelegramServiceFactory.getInstance(tgCredentials.botToken);

        // Convert Buffer to Stream
        const fileStream = Stream.Readable.from(file.buffer);

        try {
            const { messageId, fileId } = await telegramService.uploadFile(
                tgCredentials.chatId,
                fileStream,
                file.originalname
            );

            const newFile = await fileRepository.create({
                ownerId: new Types.ObjectId(ownerId) as any,
                name: file.originalname,
                size: file.size,
                mimeType: file.mimetype,
                parentFolderId: parentFolderId ? new Types.ObjectId(parentFolderId) : null,
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
        const file = await fileRepository.findById(fileId, ownerId);
        if (!file) {
            throw ApiError.NotFound('File not found');
        }

        if (!file.telegramFileId) {
            throw ApiError.BadRequest('File not uploaded to Telegram correctly');
        }

        const telegramService = TelegramServiceFactory.getInstance(tgCredentials.botToken);
        const fileLink = await telegramService.getFileLink(file.telegramFileId);

        return {
            file,
            fileLink
        };
    }

    async getFileStreamWithMetadata(fileId: string, ownerId: string, tgCredentials: { botToken: string }) {
        const file = await fileRepository.findById(fileId, ownerId);
        if (!file) {
            throw ApiError.NotFound('File not found');
        }

        if (!file.telegramFileId) {
            throw ApiError.BadRequest('File not uploaded to Telegram correctly');
        }

        const telegramService = TelegramServiceFactory.getInstance(tgCredentials.botToken);
        const stream = await telegramService.getFileStream(file.telegramFileId);

        return {
            file,
            stream
        };
    }

    async renameFile(fileId: string, name: string, ownerId: string) {
        const file = await fileRepository.findById(fileId, ownerId);
        if (!file) {
            throw ApiError.NotFound('File not found');
        }

        // Check for collisions in both files and folders
        const collisionFile = await fileRepository.checkNameCollision(
            ownerId,
            file.parentFolderId?.toString() || null,
            name,
            fileId
        );

        const collisionFolder = await folderRepository.checkNameCollision(
            ownerId,
            file.parentFolderId?.toString() || null,
            name
        );

        if (collisionFile || collisionFolder) {
            throw ApiError.BadRequest('A file or folder with this name already exists in this directory');
        }

        const updatedFile = await fileRepository.update(fileId, { name });
        return updatedFile;
    }

    async moveFile(fileId: string, parentFolderId: string | null, ownerId: string) {
        const file = await fileRepository.findById(fileId, ownerId);
        if (!file) {
            throw ApiError.NotFound('File not found');
        }

        const updatedFile = await fileRepository.update(fileId, {
            parentFolderId: parentFolderId ? new Types.ObjectId(parentFolderId) : null
        });
        return updatedFile;
    }

    async deleteFile(fileId: string, ownerId: string, tgCredentials: { botToken: string; chatId: string }) {
        const file = await fileRepository.findById(fileId, ownerId);
        if (!file) {
            throw ApiError.NotFound('File not found');
        }

        const telegramService = TelegramServiceFactory.getInstance(tgCredentials.botToken);
        await telegramService.deleteMessage(tgCredentials.chatId, file.telegramMessageId);

        await fileRepository.delete(fileId);
        return file;
    }
}


export default new FilesService();