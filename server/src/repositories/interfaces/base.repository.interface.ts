import { OwnedDocument } from '../base.repository';
import { IQueryBuilder } from './query.builder.interface';

export interface IBaseRepository<T extends OwnedDocument> {
    query(): IQueryBuilder<T>;
    create(data: Partial<T>): Promise<T>;
    findById(id: string, ownerId: string): Promise<T | null>;
    checkNameCollision(
        ownerId: string,
        parentFolderId: string | null,
        name: string,
        excludeId?: string
    ): Promise<T | null>;
    delete(id: string): Promise<void>;
    update(id: string, updateData: Partial<T>): Promise<T | null>;
    find(query: any): Promise<T[]>;
}
