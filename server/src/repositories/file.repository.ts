import { Types } from 'mongoose';
import { File, IFile } from '../models/file.model';

export class FileRepository {
    async create(fileData: Partial<IFile>): Promise<IFile> {
        return File.create(fileData);
    }

    async findById(id: string, ownerId: string): Promise<IFile | null> {
        return File.findOne({ _id: id, ownerId });
    }

    async checkNameCollision(
        ownerId: string,
        parentFolderId: string | null,
        name: string,
        excludeId?: string
    ): Promise<IFile | null> {
        const query: any = {
            ownerId,
            parentFolderId: parentFolderId || null,
            name,
        };

        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        return File.findOne(query);
    }

    async delete(id: string): Promise<void> {
        await File.deleteOne({ _id: id });
    }

    async update(id: string, updateData: Partial<IFile>): Promise<IFile | null> {
        return File.findByIdAndUpdate(id, updateData, { new: true });
    }

    async find(query: any): Promise<IFile[]> {
        return File.find(query);
    }
}

export default new FileRepository();
