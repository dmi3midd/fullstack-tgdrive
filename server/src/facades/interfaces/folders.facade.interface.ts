import { IFolder } from '../../models/folder.model';
import { IFile } from '../../models/file.model';
import { TgCredentials } from './files.facade.interface';

export interface BreadcrumbItem {
    _id: unknown;
    name: string;
}

export interface FolderContents {
    folders: IFolder[];
    files: IFile[];
    path: BreadcrumbItem[];
}

export interface FolderTreeNode {
    _id: unknown;
    ownerId: unknown;
    name: string;
    parentFolderId: unknown | null;
    children: FolderTreeNode[];
}

export interface IFoldersFacade {
    createFolder(name: string, parentFolderId: string | null, ownerId: string): Promise<IFolder>;
    getFolderContents(parentId: string | null, ownerId: string): Promise<FolderContents>;
    renameFolder(folderId: string, name: string, ownerId: string): Promise<IFolder | null>;
    moveFolder(folderId: string, newParentId: string | null, ownerId: string): Promise<IFolder | null>;
    deleteFolder(folderId: string, ownerId: string, tgCredentials: TgCredentials): Promise<{ message: string }>;
    getTree(ownerId: string): Promise<FolderTreeNode[]>;
}
