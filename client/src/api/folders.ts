import client from './client';
import type { FolderItem, FolderContentResponse } from '../types/files';

export const foldersApi = {
    create: async (name: string, parentFolderId?: string | null) => {
        const response = await client.post<FolderItem>('/folders', { name, parentFolderId });
        return response.data;
    },

    getContents: async (parentId: string | null = null) => {
        const params = parentId ? { parentId } : {};
        const response = await client.get<FolderContentResponse>('/folders', { params });
        return response.data;
    },

    getTree: async () => {
        // Assuming backend supports this or we ignore it for now if not implemented in router
        // Check router: router.get('/tree', ...); Yes it does!
        const response = await client.get<any>('/folders/tree');
        return response.data;
    },

    rename: async (folderId: string, name: string) => {
        const response = await client.patch<FolderItem>(`/folders/${folderId}`, { name });
        return response.data;
    },

    move: async (folderId: string, parentFolderId: string | null) => {
        const response = await client.patch<FolderItem>(`/folders/${folderId}/move`, { parentFolderId });
        return response.data;
    },

    delete: async (folderId: string) => {
        await client.delete(`/folders/${folderId}`);
    }
};
