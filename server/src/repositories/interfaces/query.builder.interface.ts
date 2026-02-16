export interface IQueryBuilder<T> {
    byOwner(ownerId: string): this;
    inFolder(parentFolderId: string | null): this;
    withName(name: string): this;
    excludeId(id: string): this;
    where(field: string, value: any): this;
    findMany(): Promise<T[]>;
    findOne(): Promise<T | null>;
}
