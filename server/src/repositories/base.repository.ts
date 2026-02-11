import { Document, Model, Types } from 'mongoose';

export interface OwnedDocument extends Document {
    ownerId: Types.ObjectId;
    name: string;
    parentFolderId: Types.ObjectId | null;
}

export abstract class BaseRepository<T extends OwnedDocument> {
    protected abstract model: Model<T>;

    async create(data: Partial<T>): Promise<T> {
        return this.model.create(data as any);
    }

    async findById(id: string, ownerId: string): Promise<T | null> {
        return this.model.findOne({ _id: id, ownerId } as any);
    }

    async checkNameCollision(
        ownerId: string,
        parentFolderId: string | null,
        name: string,
        excludeId?: string
    ): Promise<T | null> {
        const query: any = {
            ownerId,
            parentFolderId: parentFolderId || null,
            name,
        };

        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        return this.model.findOne(query);
    }

    async delete(id: string): Promise<void> {
        await this.model.deleteOne({ _id: id } as any);
    }

    async update(id: string, updateData: Partial<T>): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, updateData, { new: true });
    }

    async find(query: any): Promise<T[]> {
        return this.model.find(query);
    }
}
