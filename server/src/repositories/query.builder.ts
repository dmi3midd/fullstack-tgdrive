import { Model, Types } from 'mongoose';
import { OwnedDocument } from './base.repository';
import { IQueryBuilder } from './interfaces';

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
