export interface FileItem {
    _id: string;
    name: string;
    size: number;
    mimeType: string;
    parentFolderId: string | null;
    updatedAt: string;
    createdAt: string;
}

export interface FolderItem {
    _id: string;
    name: string;
    parentFolderId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface FileSystemItem {
    _id: string;
    name: string;
    type: 'file' | 'folder';
    size?: number;
    mimeType?: string;
    updatedAt: string;
}

export interface FolderContentResponse {
    folders: FolderItem[];
    files: FileItem[];
    path: { _id: string; name: string }[];
}
