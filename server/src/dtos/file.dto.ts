import { IFile } from "../models/file.model";

export class FileDto {
    id: string;
    name: string;
    size: number;
    mimeType: string;
    parentFolderId: string | null;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(model: IFile) {
        this.id = model._id.toString();
        this.name = model.name;
        this.size = model.size;
        this.mimeType = model.mimeType;
        this.parentFolderId = model.parentFolderId ? model.parentFolderId.toString() : null;
        this.ownerId = model.ownerId.toString();
        this.createdAt = (model as any).createdAt;
        this.updatedAt = (model as any).updatedAt;
    }
}
