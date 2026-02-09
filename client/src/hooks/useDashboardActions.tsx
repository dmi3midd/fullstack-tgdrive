import { useState } from 'react';
import { foldersApi } from '../api/folders';
import { filesApi } from '../api/files';
import { useFileUpload } from './useFileUpload';

export const useDashboardActions = (currentFolderId: string | null, refreshContent: () => Promise<void>) => {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

    // Move state
    const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
    const [moveItem, setMoveItem] = useState<{ type: 'file' | 'folder', id: string, name: string } | null>(null);

    // Rename state
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [renameItem, setRenameItem] = useState<{ type: 'file' | 'folder', id: string, name: string } | null>(null);

    // Context Menu state
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        item: { type: 'file' | 'folder', id: string, name: string } | null;
    } | null>(null);

    const handleCreateFolder = async (name: string) => {
        await foldersApi.create(name, currentFolderId);
        await refreshContent();
    };

    const { triggerUpload, HiddenInput } = useFileUpload(async (files) => {
        const MAX_SIZE = 50 * 1024 * 1024; // 50MB
        const largeFiles = Array.from(files).filter(file => file.size > MAX_SIZE);

        if (largeFiles.length > 0) {
            setNotification({
                message: `File "${largeFiles[0].name}" exceeds common 50MB limit.`,
                type: 'warning'
            });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        try {
            const total = files.length;
            for (let i = 0; i < total; i++) {
                await filesApi.upload(files[i], currentFolderId);
                setUploadProgress(((i + 1) / total) * 100);
            }
            await refreshContent();
            setNotification({ message: 'Files uploaded successfully', type: 'success' });
        } catch (e) {
            console.error("Upload failed", e);
            setNotification({ message: 'Upload failed. Please try again.', type: 'error' });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    });

    const handleContextMenu = (e: React.MouseEvent, type: 'file' | 'folder', id: string, name: string) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            item: { type, id, name }
        });
    };

    const handleDelete = async () => {
        if (!contextMenu?.item) return;
        if (!confirm(`Are you sure you want to delete ${contextMenu.item.name}?`)) return;

        try {
            if (contextMenu.item.type === 'file') {
                await filesApi.delete(contextMenu.item.id);
            } else {
                await foldersApi.delete(contextMenu.item.id);
            }
            await refreshContent();
        } catch (e) {
            console.error("Delete failed", e);
        }
        setContextMenu(null);
    };

    const handleMoveClick = () => {
        if (!contextMenu?.item) return;
        setMoveItem(contextMenu.item);
        setIsMoveDialogOpen(true);
        setContextMenu(null);
    };

    const handleRenameClick = () => {
        if (!contextMenu?.item) return;
        setRenameItem(contextMenu.item);
        setIsRenameDialogOpen(true);
        setContextMenu(null);
    };

    const handleRename = async (name: string) => {
        if (!renameItem) return;
        try {
            if (renameItem.type === 'file') {
                await filesApi.rename(renameItem.id, name);
            } else {
                await foldersApi.rename(renameItem.id, name);
            }
            await refreshContent();
            setNotification({ message: 'Renamed successfully', type: 'success' });
        } catch (e: any) {
            console.error("Rename failed", e);
            const errorMessage = e.response?.data?.message || 'Rename failed';
            setNotification({ message: errorMessage, type: 'error' });
        }
    };

    const handleDownload = async () => {
        if (!contextMenu?.item || contextMenu.item.type !== 'file') return;
        const token = localStorage.getItem('accessToken');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const downloadUrl = `${apiUrl}/files/${contextMenu.item.id}/stream?token=${token}`;

        window.open(downloadUrl, '_blank');
        setContextMenu(null);
    };

    const onDragStart = (e: React.DragEvent, type: 'file' | 'folder', id: string, name: string) => {
        e.dataTransfer.setData('type', type);
        e.dataTransfer.setData('id', id);
        e.dataTransfer.setData('name', name);
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const onDrop = async (e: React.DragEvent, targetFolderId: string | null) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('type') as 'file' | 'folder';
        const id = e.dataTransfer.getData('id');
        const name = e.dataTransfer.getData('name');

        if (id === targetFolderId) return;

        try {
            if (type === 'file') {
                await filesApi.move(id, targetFolderId);
            } else {
                await foldersApi.move(id, targetFolderId);
            }
            await refreshContent();
            setNotification({ message: `Moved ${name} successfully`, type: 'success' });
        } catch (error) {
            console.error('Move failed', error);
            setNotification({ message: 'Move failed', type: 'error' });
        }
    };

    return {
        uploadProgress,
        isUploading,
        notification,
        setNotification,
        isMoveDialogOpen,
        setIsMoveDialogOpen,
        moveItem,
        setMoveItem,
        contextMenu,
        setContextMenu,
        handleCreateFolder,
        triggerUpload,
        HiddenInput,
        handleContextMenu,
        handleDelete,
        handleMoveClick,
        handleDownload,
        onDragStart,
        onDragOver,
        onDrop,
        isRenameDialogOpen,
        setIsRenameDialogOpen,
        renameItem,
        setRenameItem,
        handleRenameClick,
        handleRename
    };
};
