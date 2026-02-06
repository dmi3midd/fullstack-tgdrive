import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validationResult } from 'express-validator';
import multer from 'multer';
import filesService from '../services/files.service';
import ApiError from '../exceptions/api.error';
import { AuthRequest } from '../middlewares/auth.middleware';

class FilesController {
    async uploadFile(req: Request, res: Response, next: NextFunction) {
        try {
            const authReq = req as AuthRequest;
            const file = req.file;
            const { parentFolderId } = req.body;

            if (!file) {
                throw ApiError.BadRequest('No file uploaded');
            }

            const uploadedFile = await filesService.uploadFile(
                file,
                authReq.user.id,
                authReq.tgCredentials,
                parentFolderId
            );

            return res.status(201).json(uploadedFile);
        } catch (error) {
            next(error);
        }
    }

    async downloadFile(req: Request, res: Response, next: NextFunction) {
        try {
            const authReq = req as AuthRequest;
            const fileId = req.params.id as string;

            const { file, fileLink } = await filesService.downloadFile(
                fileId,
                authReq.user.id,
                authReq.tgCredentials
            );

            return res.json({ file, downloadLink: fileLink });
        } catch (error) {
            next(error);
        }
    }

    async renameFile(req: Request, res: Response, next: NextFunction) {
        try {
            const authReq = req as AuthRequest;
            const fileId = req.params.id as string;
            const { name } = req.body;

            if (!name) {
                throw ApiError.BadRequest('New name is required');
            }

            const updatedFile = await filesService.renameFile(fileId, name, authReq.user.id);
            return res.json(updatedFile);
        } catch (error) {
            next(error);
        }
    }

    async moveFile(req: Request, res: Response, next: NextFunction) {
        try {
            const authReq = req as AuthRequest;
            const fileId = req.params.id as string;
            const { parentFolderId } = req.body;

            const updatedFile = await filesService.moveFile(fileId, parentFolderId as string | null, authReq.user.id);
            return res.json(updatedFile);
        } catch (error) {
            next(error);
        }
    }

    async deleteFile(req: Request, res: Response, next: NextFunction) {
        try {
            const authReq = req as AuthRequest;
            const fileId = req.params.id as string;

            await filesService.deleteFile(fileId, authReq.user.id, authReq.tgCredentials);
            return res.json({ message: 'File deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

export default new FilesController();