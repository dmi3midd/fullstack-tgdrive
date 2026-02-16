import { IFolder, Folder } from '../models/folder.model';
import { IFile, File } from '../models/file.model';
import { Types } from 'mongoose';
import ApiError from '../exceptions/api.error';
import filesService from './files.facade';
import filesObserver, { EventType } from '../observers/files.observer';
import { QueryBuilder } from '../builders/query.builder';
import { IFoldersFacade } from './interfaces';

class FoldersFacade implements IFoldersFacade {
    async createFolder(name: string, parentFolderId: string | null, ownerId: string) {
        const folder = await Folder.create({
            ownerId: new Types.ObjectId(ownerId),
            name,
            parentFolderId: parentFolderId ? new Types.ObjectId(parentFolderId) : null,
        });

        filesObserver.emit(EventType.FOLDER_CREATED, folder);

        return folder;
    }

    async getFolderContents(parentId: string | null, ownerId: string) {
        const folders = await new QueryBuilder<IFolder>(Folder)
            .byOwner(ownerId)
            .inFolder(parentId)
            .findMany();

        const files = await new QueryBuilder<IFile>(File)
            .byOwner(ownerId)
            .inFolder(parentId)
            .findMany();

        const path: any[] = [];
        if (parentId) {
            let currentId: string | null = parentId;
            while (currentId) {
                const currentFolder: IFolder | null = await Folder.findOne({ _id: currentId, ownerId });
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
        const folder = await Folder.findOne({ _id: folderId, ownerId });
        if (!folder) {
            throw ApiError.NotFound('Folder not found');
        }

        // Check for collisions in both files and folders
        const collisionFile = await new QueryBuilder<IFile>(File)
            .byOwner(ownerId)
            .inFolder(folder.parentFolderId?.toString() || null)
            .withName(name)
            .findOne();

        const folderCollisionBuilder = new QueryBuilder<IFolder>(Folder)
            .byOwner(ownerId)
            .inFolder(folder.parentFolderId?.toString() || null)
            .withName(name)
            .excludeId(folderId);

        const collisionFolder = await folderCollisionBuilder.findOne();

        if (collisionFile || collisionFolder) {
            throw ApiError.BadRequest('A file or folder with this name already exists in this directory');
        }

        const updatedFolder = await Folder.findByIdAndUpdate(folderId, { name }, { new: true });

        filesObserver.emit(EventType.FOLDER_RENAMED, updatedFolder);

        return updatedFolder;
    }

    async moveFolder(folderId: string, newParentId: string | null, ownerId: string) {
        const folder = await Folder.findOne({ _id: folderId, ownerId });
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
                const parentFolder: IFolder | null = await Folder.findOne({ _id: currentParentId, ownerId });
                currentParentId = parentFolder?.parentFolderId ? parentFolder.parentFolderId.toString() : null;
            }
        }

        const updatedFolder = await Folder.findByIdAndUpdate(folderId, {
            parentFolderId: newParentId ? new Types.ObjectId(newParentId) : null
        }, { new: true });

        filesObserver.emit(EventType.FOLDER_MOVED, updatedFolder);

        return updatedFolder;
    }

    async deleteFolder(folderId: string, ownerId: string, tgCredentials: { botToken: string; chatId: string }) {
        const folder = await Folder.findOne({ _id: folderId, ownerId });
        if (!folder) {
            throw ApiError.NotFound('Folder not found');
        }

        // Recursively delete subfolders
        const subfolders = await new QueryBuilder<IFolder>(Folder)
            .byOwner(ownerId)
            .inFolder(folderId)
            .findMany();

        for (const subfolder of subfolders) {
            await this.deleteFolder(subfolder._id.toString(), ownerId, tgCredentials);
        }

        // Delete files in this folder
        const files = await new QueryBuilder<IFile>(File)
            .byOwner(ownerId)
            .inFolder(folderId)
            .findMany();

        for (const file of files) {
            await filesService.deleteFile(file._id.toString(), ownerId, tgCredentials);
        }

        await Folder.deleteOne({ _id: folderId });

        filesObserver.emit(EventType.FOLDER_DELETED, { folderId, ownerId });

        return { message: 'Folder and contents deleted' };
    }

    async getTree(ownerId: string) {
        const folders = await new QueryBuilder<IFolder>(Folder)
            .byOwner(ownerId)
            .findMany();

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
                    rootFolders.push(folderMap[folder._id.toString()]);
                }
            } else {
                rootFolders.push(folderMap[folder._id.toString()]);
            }
        });

        return rootFolders;
    }
}

export default new FoldersFacade();