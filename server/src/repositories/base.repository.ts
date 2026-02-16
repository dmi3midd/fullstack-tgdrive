import { Document, Model, Types } from 'mongoose';
import { QueryBuilder } from './query.builder';
import { IBaseRepository } from './interfaces';

export interface OwnedDocument extends Document {
    ownerId: Types.ObjectId;
    name: string;
    parentFolderId: Types.ObjectId | null;
}

export abstract class BaseRepository<T extends OwnedDocument> implements IBaseRepository<T> {
    protected abstract model: Model<T>;

    query(): QueryBuilder<T> {
        return new QueryBuilder<T>(this.model);
    }

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
        const builder = this.query()
            .byOwner(ownerId)
            .inFolder(parentFolderId)
            .withName(name);

        if (excludeId) {
            builder.excludeId(excludeId);
        }

        return builder.findOne();
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
