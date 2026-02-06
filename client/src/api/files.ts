import client from './client';
import type { FileItem } from '../types/files';

export const filesApi = {
    upload: async (file: File, parentFolderId?: string | null) => {
        const formData = new FormData();
        formData.append('file', file);
        if (parentFolderId) {
            formData.append('parentFolderId', parentFolderId);
        }

        const response = await client.post<FileItem>('/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    download: async (fileId: string) => {
        const response = await client.get<{ file: FileItem, downloadLink: string }>(`/files/${fileId}/download`);
        return response.data;
    },

    rename: async (fileId: string, name: string) => {
        const response = await client.patch<FileItem>(`/files/${fileId}/rename`, { name });
        return response.data;
    },

    move: async (fileId: string, parentFolderId: string | null) => {
        const response = await client.patch<FileItem>(`/files/${fileId}/move`, { parentFolderId });
        return response.data;
    },

    delete: async (fileId: string) => {
        await client.delete(`/files/${fileId}`);
    }
};
