import { Document, Model, Types } from 'mongoose';

export interface OwnedDocument extends Document {
    ownerId: Types.ObjectId;
    name: string;
    parentFolderId: Types.ObjectId | null;
}

export interface IQueryBuilder<T> {
    byOwner(ownerId: string): this;
    inFolder(parentFolderId: string | null): this;
    withName(name: string): this;
    excludeId(id: string): this;
    where(field: string, value: any): this;
    findMany(): Promise<T[]>;
    findOne(): Promise<T | null>;
}

export class QueryBuilder<T extends OwnedDocument> implements IQueryBuilder<T> {
    private filters: Record<string, any> = {};

    constructor(private model: Model<T>) { }

    byOwner(ownerId: string): this {
        this.filters.ownerId = ownerId;
        return this;
    }

    inFolder(parentFolderId: string | null): this {
        this.filters.parentFolderId = parentFolderId
            ? new Types.ObjectId(parentFolderId)
            : null;
        return this;
    }

    withName(name: string): this {
        this.filters.name = name;
        return this;
    }

    excludeId(id: string): this {
        this.filters._id = { $ne: id };
        return this;
    }

    where(field: string, value: any): this {
        this.filters[field] = value;
        return this;
    }

    async findMany(): Promise<T[]> {
        return this.model.find(this.filters);
    }

    async findOne(): Promise<T | null> {
        return this.model.findOne(this.filters);
    }
}
