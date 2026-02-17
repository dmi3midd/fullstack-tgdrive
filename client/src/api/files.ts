import { BaseResourceApi } from './base-resource.api';
import type { FileItem } from '../types/files';

class FilesApi extends BaseResourceApi<FileItem> {
    protected readonly basePath = '/files';

    async upload(file: File, parentFolderId?: string | null): Promise<FileItem> {
        const formData = new FormData();
        formData.append('file', file);
        if (parentFolderId) {
            formData.append('parentFolderId', parentFolderId);
        }

        const response = await this.client.post<FileItem>('/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    async download(fileId: string): Promise<{ file: FileItem; downloadLink: string }> {
        const response = await this.client.get<{ file: FileItem; downloadLink: string }>(`/files/${fileId}/download`);
        return response.data;
    }

    protected override renameSuffix(): string {
        return '/rename';
    }
}

export const filesApi = new FilesApi();
