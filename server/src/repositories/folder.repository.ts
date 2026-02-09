import { Types } from 'mongoose';
import { Folder, IFolder } from '../models/folder.model';

export class FolderRepository {
    async create(folderData: Partial<IFolder>): Promise<IFolder> {
        return Folder.create(folderData);
    }

    async findById(id: string, ownerId: string): Promise<IFolder | null> {
        return Folder.findOne({ _id: id, ownerId });
    }

    async checkNameCollision(
        ownerId: string,
        parentFolderId: string | null,
        name: string,
        excludeId?: string
    ): Promise<IFolder | null> {
        const query: any = {
            ownerId,
            parentFolderId: parentFolderId || null,
            name,
        };

        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        return Folder.findOne(query);
    }

    async delete(id: string): Promise<void> {
        await Folder.deleteOne({ _id: id });
    }

    async update(id: string, updateData: Partial<IFolder>): Promise<IFolder | null> {
        return Folder.findByIdAndUpdate(id, updateData, { new: true });
    }

    async find(query: any): Promise<IFolder[]> {
        return Folder.find(query);
    }
}

export default new FolderRepository();
