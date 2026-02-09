import { IFolder } from '../models/folder.model';
import { Types } from 'mongoose';
import ApiError from '../exceptions/api.error';
import filesService from './files.service';
import folderRepository from '../repositories/folder.repository';
import fileRepository from '../repositories/file.repository';

class FoldersService {
    async createFolder(name: string, parentFolderId: string | null, ownerId: string) {
        const folder = await folderRepository.create({
            ownerId: new Types.ObjectId(ownerId) as any,
            name,
            parentFolderId: parentFolderId ? new Types.ObjectId(parentFolderId) : null,
        });
        return folder;
    }

    async getFolderContents(parentId: string | null, ownerId: string) {
        const query = {
            ownerId,
            parentFolderId: parentId ? new Types.ObjectId(parentId) : null
        };

        const folders = await folderRepository.find(query);
        const files = await fileRepository.find(query);

        const path: any[] = [];
        if (parentId) {
            let currentId: string | null = parentId;
            while (currentId) {
                const currentFolder: IFolder | null = await folderRepository.findById(currentId, ownerId);
                if (currentFolder) {
                    path.unshift({ _id: currentFolder._id, name: currentFolder.name });
                    currentId = currentFolder.parentFolderId ? currentFolder.parentFolderId.toString() : null;
                } else {
                    currentId = null;
                }
            }
        }

        return { folders, files, path };
    }

    async renameFolder(folderId: string, name: string, ownerId: string) {
        const folder = await folderRepository.findById(folderId, ownerId);
        if (!folder) {
            throw ApiError.NotFound('Folder not found');
        }

        // Check for collisions in both files and folders
        const collisionFile = await fileRepository.checkNameCollision(
            ownerId,
            folder.parentFolderId?.toString() || null,
            name
        );

        const collisionFolder = await folderRepository.checkNameCollision(
            ownerId,
            folder.parentFolderId?.toString() || null,
            name,
            folderId
        );

        if (collisionFile || collisionFolder) {
            throw ApiError.BadRequest('A file or folder with this name already exists in this directory');
        }

        const updatedFolder = await folderRepository.update(folderId, { name });
        return updatedFolder;
    }

    async moveFolder(folderId: string, newParentId: string | null, ownerId: string) {
        const folder = await folderRepository.findById(folderId, ownerId);
        if (!folder) {
            throw ApiError.NotFound('Folder not found');
        }

        if (newParentId === folderId) {
            throw ApiError.BadRequest('Cannot move folder into itself');
        }

        // Circular check: traverse up from newParentId to absolute root
        if (newParentId) {
            let currentParentId: string | null = newParentId;
            while (currentParentId) {
                if (currentParentId === folderId) {
                    throw ApiError.BadRequest('Cannot move folder into its own subfolder');
                }
                const parentFolder: IFolder | null = await folderRepository.findById(currentParentId, ownerId);
                currentParentId = parentFolder?.parentFolderId ? parentFolder.parentFolderId.toString() : null;
            }
        }

        const updatedFolder = await folderRepository.update(folderId, {
            parentFolderId: newParentId ? new Types.ObjectId(newParentId) : null
        });
        return updatedFolder;
    }

    async deleteFolder(folderId: string, ownerId: string, tgCredentials: { botToken: string; chatId: string }) {
        const folder = await folderRepository.findById(folderId, ownerId);
        if (!folder) {
            throw ApiError.NotFound('Folder not found');
        }

        // Recursively delete subfolders
        const subfolders = await folderRepository.find({ parentFolderId: folderId, ownerId });
        for (const subfolder of subfolders) {
            await this.deleteFolder(subfolder._id.toString(), ownerId, tgCredentials);
        }

        // Delete files in this folder
        const files = await fileRepository.find({ parentFolderId: folderId, ownerId });
        for (const file of files) {
            await filesService.deleteFile(file._id.toString(), ownerId, tgCredentials);
        }

        await folderRepository.delete(folderId);
        return { message: 'Folder and contents deleted' };
    }

    async getTree(ownerId: string) {
        const folders = await folderRepository.find({ ownerId });

        // Build map for O(n) access
        const folderMap: any = {};
        const rootFolders: any[] = [];

        folders.forEach(folder => {
            folderMap[folder._id.toString()] = { ...folder.toObject(), children: [] };
        });

        folders.forEach(folder => {
            if (folder.parentFolderId) {
                const parent = folderMap[folder.parentFolderId.toString()];
                if (parent) {
                    parent.children.push(folderMap[folder._id.toString()]);
                } else {
                    // Orphaned folder, treat as root or handle error
                    rootFolders.push(folderMap[folder._id.toString()]);
                }
            } else {
                rootFolders.push(folderMap[folder._id.toString()]);
            }
        });

        // Optionally sort by name
        // const sortNodes = (nodes: any[]) => {
        //     nodes.sort((a, b) => a.name.localeCompare(b.name));
        //     nodes.forEach(node => sortNodes(node.children));
        // };
        // sortNodes(rootFolders);

        return rootFolders;
    }
}

export default new FoldersService();