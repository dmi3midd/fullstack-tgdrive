import type { AxiosInstance } from 'axios';
import client from './client';

export abstract class BaseResourceApi<T> {
    protected readonly client: AxiosInstance = client;
    protected abstract readonly basePath: string;

    async rename(id: string, name: string): Promise<T> {
        const response = await this.client.patch<T>(`${this.basePath}/${id}${this.renameSuffix()}`, { name });
        return response.data;
    }

    async move(id: string, parentFolderId: string | null): Promise<T> {
        const response = await this.client.patch<T>(`${this.basePath}/${id}/move`, { parentFolderId });
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await this.client.delete(`${this.basePath}/${id}`);
    }

    protected renameSuffix(): string {
        return '';
    }
}
