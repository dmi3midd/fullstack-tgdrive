import { IFolder } from "../models/folder.model";

export class FolderDto {
    id: string;
    name: string;
    parentFolderId: string | null;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(model: IFolder) {
        this.id = model._id.toString();
        this.name = model.name;
        this.parentFolderId = model.parentFolderId ? model.parentFolderId.toString() : null;
        this.ownerId = model.ownerId.toString();
        this.createdAt = (model as any).createdAt;
        this.updatedAt = (model as any).updatedAt;
    }
}
