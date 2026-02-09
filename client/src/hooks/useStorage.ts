import { useState, useEffect, useCallback } from 'react';
import { foldersApi } from '../api/folders';
import type { FolderContentResponse } from '../types/files';

export const useStorage = (currentFolderId: string | null) => {
    const [content, setContent] = useState<FolderContentResponse>({ folders: [], files: [], path: [] });
    const [isLoading, setIsLoading] = useState(false);

    const refreshContent = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await foldersApi.getContents(currentFolderId);
            setContent(data);
        } catch (e) {
            console.error("Failed to load folder", e);
        } finally {
            setIsLoading(false);
        }
    }, [currentFolderId]);

    useEffect(() => {
        refreshContent();
    }, [refreshContent]);

    return {
        content,
        isLoading,
        refreshContent
    };
};
