export interface FileItem {
    id: string;
    name: string;
    size: number;
    mimeType: string;
    parentFolderId: string | null;
    updatedAt: string;
    createdAt: string;
    ownerId: string;
}

export interface FolderItem {
    id: string;
    name: string;
    parentFolderId: string | null;
    createdAt: string;
    updatedAt: string;
    ownerId: string;
}

export interface FileSystemItem {
    id: string;
    name: string;
    type: 'file' | 'folder';
    size?: number;
    mimeType?: string;
    updatedAt: string;
}

export interface FolderPathItem {
    id: string;
    name: string;
}

export interface FolderContentResponse {
    folders: FolderItem[];
    files: FileItem[];
    path: FolderPathItem[];
}
