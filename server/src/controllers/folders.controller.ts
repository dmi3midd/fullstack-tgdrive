import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { AuthRequest } from '../middlewares/auth.middleware';
import foldersService from '../services/folders.service';
import { FolderDto } from '../dtos/folder.dto';
import { FileDto } from '../dtos/file.dto';

const createFolderSchema = z.object({
    name: z.string().min(1),
    parentFolderId: z.string().optional().nullable(),
});

class FoldersController {
    async createFolder(req: Request, res: Response, next: NextFunction) {
        try {
            const authRequest = req as AuthRequest;
            const { name, parentFolderId } = createFolderSchema.parse(authRequest.body);
            const folder = await foldersService.createFolder(name, parentFolderId || null, authRequest.user.id);
            return res.status(201).json(new FolderDto(folder));
        } catch (error) {
            next(error);
        }
    }

    async getFolderContents(req: Request, res: Response, next: NextFunction) {
        try {
            const authRequest = req as AuthRequest;
            const parentId = typeof req.query.parentId === 'string' ? req.query.parentId : null;
            const contents = await foldersService.getFolderContents(parentId, authRequest.user.id);

            return res.json({
                files: contents.files.map(file => new FileDto(file)),
                folders: contents.folders.map(folder => new FolderDto(folder)),
                path: contents.path.map((p: any) => ({ id: p._id.toString(), name: p.name }))
            });
        } catch (error) {
            next(error);
        }
    }

    async renameFolder(req: Request, res: Response, next: NextFunction) {
        try {
            const authRequest = req as AuthRequest;
            const folderId = req.params.id as string;
            const { name } = req.body;

            if (!name) {
                throw new Error('Name is required');
            }

            const folder = await foldersService.renameFolder(folderId, name, authRequest.user.id);
            if (!folder) {
                throw new Error('Folder not found');
            }
            return res.json(new FolderDto(folder));
        } catch (error) {
            next(error);
        }
    }

    async moveFolder(req: Request, res: Response, next: NextFunction) {
        try {
            const authRequest = req as AuthRequest;
            const folderId = req.params.id as string;
            const { parentFolderId } = req.body;

            const folder = await foldersService.moveFolder(folderId, parentFolderId as string | null, authRequest.user.id);
            if (!folder) {
                throw new Error('Folder not found');
            }
            return res.json(new FolderDto(folder));
        } catch (error) {
            next(error);
        }
    }

    async deleteFolder(req: Request, res: Response, next: NextFunction) {
        try {
            const authRequest = req as AuthRequest;
            const folderId = req.params.id as string;

            const result = await foldersService.deleteFolder(folderId, authRequest.user.id, authRequest.tgCredentials);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getTree(req: Request, res: Response, next: NextFunction) {
        try {
            const authRequest = req as AuthRequest;
            const tree = await foldersService.getTree(authRequest.user.id);
            // Tree might be complex structure, for now just returning as is but ideally should be mapped if it contains raw mongoose docs
            return res.json(tree);
        } catch (error) {
            next(error);
        }
    }
}

export default new FoldersController();