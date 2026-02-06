import { Folder, IFolder } from '../models/folder.model';
import { File } from '../models/file.model';
import { Types } from 'mongoose';
import ApiError from '../exceptions/api.error';
import filesService from './files.service';

class FoldersService {
    async createFolder(name: string, parentFolderId: string | null, ownerId: string) {
        const folder = new Folder({
            ownerId,
            name,
            parentFolderId: parentFolderId ? new Types.ObjectId(parentFolderId) : null,
        });
        await folder.save();
        return folder;
    }

    async getFolderContents(parentId: string | null, ownerId: string) {
        const query = {
            ownerId,
            parentFolderId: parentId ? new Types.ObjectId(parentId) : null
        };

        const folders = await Folder.find(query);
        const files = await File.find(query);

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
        folder.name = name;
        await folder.save();
        return folder;
    }

    async moveFolder(folderId: string, newParentId: string | null, ownerId: string) {
        const folder = await Folder.findOne({ _id: folderId, ownerId });
        if (!folder) {
            throw ApiError.NotFound('Folder not found');
        }

        // Prevent moving folder into itself or its children - simplified check for now
        if (newParentId === folderId) {
            throw ApiError.BadRequest('Cannot move folder into itself');
        }

        // Proper circular check would require traversing up from newParentId

        folder.parentFolderId = newParentId ? new Types.ObjectId(newParentId) : null;
        await folder.save();
        return folder;
    }

    async deleteFolder(folderId: string, ownerId: string, tgCredentials: { botToken: string; chatId: string }) {
        const folder = await Folder.findOne({ _id: folderId, ownerId });
        if (!folder) {
            throw ApiError.NotFound('Folder not found');
        }

        // Recursively delete subfolders
        const subfolders = await Folder.find({ parentFolderId: folderId, ownerId });
        for (const subfolder of subfolders) {
            await this.deleteFolder(subfolder._id.toString(), ownerId, tgCredentials);
        }

        // Delete files in this folder
        const files = await File.find({ parentFolderId: folderId, ownerId });
        for (const file of files) {
            await filesService.deleteFile(file._id.toString(), ownerId, tgCredentials);
        }

        await folder.deleteOne();
        return { message: 'Folder and contents deleted' };
    }

    async getTree(ownerId: string) {
        const folders = await Folder.find({ ownerId });

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