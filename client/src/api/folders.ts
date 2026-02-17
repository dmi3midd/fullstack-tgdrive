import { BaseResourceApi } from './base-resource.api';
import type { FolderItem, FolderContentResponse } from '../types/files';

class FoldersApi extends BaseResourceApi<FolderItem> {
    protected readonly basePath = '/folders';

    async create(name: string, parentFolderId?: string | null): Promise<FolderItem> {
        const response = await this.client.post<FolderItem>('/folders', { name, parentFolderId });
        return response.data;
    }

    async getContents(parentId: string | null = null): Promise<FolderContentResponse> {
        const params = parentId ? { parentId } : {};
        const response = await this.client.get<FolderContentResponse>('/folders', { params });
        return response.data;
    }

    async getTree(): Promise<any> {
        const response = await this.client.get<any>('/folders/tree');
        return response.data;
    }
}

export const foldersApi = new FoldersApi();
