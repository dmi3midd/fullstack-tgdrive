import React, { useEffect, useState } from 'react';
import { Folder, Upload, Plus, ChevronRight, MoreVertical, Download, Trash2, ArrowLeft, MoreHorizontal, Move } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { foldersApi } from '../api/folders';
import { filesApi } from '../api/files';
import type { FolderContentResponse } from '../types/files';
import { CreateFolderDialog } from '../components/CreateFolderDialog';
import { useFileUpload } from '../hooks/useFileUpload';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Toast } from '../components/ui/Toast';
import { getFileIcon } from '../utils/getFileIcon';
import { MoveDialog } from '../components/MoveDialog';
export const Dashboard: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const currentFolderId = searchParams.get('folderId');

    const [content, setContent] = useState<FolderContentResponse>({ folders: [], files: [], path: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

    // Move state
    const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
    const [moveItem, setMoveItem] = useState<{ type: 'file' | 'folder', id: string, name: string } | null>(null);

    // Context Menu state
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        item: { type: 'file' | 'folder', id: string, name: string } | null;
    } | null>(null);

    const refreshContent = async () => {
        setIsLoading(true);
        try {
            const data = await foldersApi.getContents(currentFolderId);
            setContent(data);
        } catch (e) {
            console.error("Failed to load folder", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshContent();
    }, [currentFolderId]);

    const handleFolderClick = (id: string) => {
        setSearchParams({ folderId: id });
    };

    const handleCreateFolder = async (name: string) => {
        await foldersApi.create(name, currentFolderId);
        refreshContent();
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
            refreshContent();
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
            refreshContent();
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

    const handleDownload = async () => {
        if (!contextMenu?.item || contextMenu.item.type !== 'file') return;
        try {
            const { downloadLink } = await filesApi.download(contextMenu.item.id);
            window.open(downloadLink, '_blank');
        } catch (e) {
            console.error("Download failed", e);
        }
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
            refreshContent();
            setNotification({ message: `Moved ${name} successfully`, type: 'success' });
        } catch (error) {
            console.error('Move failed', error);
            setNotification({ message: 'Move failed', type: 'error' });
        }
    };

    return (
        <div className="space-y-12" onClick={() => setContextMenu(null)}>
            <HiddenInput />
            <CreateFolderDialog
                open={isCreateFolderOpen}
                onClose={() => setIsCreateFolderOpen(false)}
                onSubmit={handleCreateFolder}
            />

            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-brand-accent/10">
                <div className="space-y-4 max-w-full overflow-hidden">
                    <div className="flex items-center gap-2 text-brand-accent/50 overflow-x-auto scrollbar-hide pb-1">
                        <button
                            onClick={() => setSearchParams({})}
                            className="hover:text-brand-text transition-all p-1.5 rounded-lg hover:bg-brand-surface shrink-0"
                        >
                            <Folder size={16} />
                        </button>

                        {content.path.map((item, index) => (
                            <React.Fragment key={item._id}>
                                <ChevronRight size={12} className="shrink-0 opacity-30" />
                                <button
                                    onClick={() => handleFolderClick(item._id)}
                                    className={`text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap px-2 py-1.5 rounded-lg transition-all shrink-0
                                        ${index === content.path.length - 1
                                            ? 'text-brand-accent bg-brand-accent/10 border border-brand-accent/20'
                                            : 'hover:text-brand-text hover:bg-brand-surface'}`}
                                >
                                    {item.name}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-brand-text uppercase tracking-tighter leading-none">
                        {currentFolderId && content.path.length > 0
                            ? content.path[content.path.length - 1].name
                            : 'My Storage'}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    {currentFolderId && (
                        <Button variant="ghost" onClick={() => navigate(-1)} className="hidden sm:inline-flex">
                            <ArrowLeft size={18} className="mr-2" /> Back
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => setIsCreateFolderOpen(true)}>
                        <Plus size={18} className="mr-2" /> New Folder
                    </Button>
                    <Button onClick={triggerUpload} isLoading={isUploading} className="shadow-[0_0_20px_rgba(198,172,143,0.3)]">
                        {!isUploading && <Upload size={18} className="mr-2" />}
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </div>
            </div>

            {isUploading && (
                <div className="bg-brand-surface border border-brand-accent/20 rounded-2xl p-6 shadow-2xl">
                    <div className="flex justify-between text-[10px] mb-3 font-black uppercase tracking-widest text-brand-accent">
                        <span>Encrypting & Uploading...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-brand-muted/20 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-brand-accent h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(198,172,143,0.5)]"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {isLoading && !isUploading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6 bg-brand-surface/20 rounded-3xl border border-brand-accent/5">
                    <Spinner size="lg" />
                    <p className="text-brand-accent/40 font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing...</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Empty State */}
                    {/* {content.folders.length === 0 && content.files.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-brand-accent/10 rounded-[2rem] bg-brand-surface/10">
                            <div className="bg-brand-surface p-6 rounded-3xl shadow-xl border border-brand-accent/10 mb-6">
                                <Upload size={40} className="text-brand-accent opacity-20" />
                            </div>
                            <h3 className="text-xl font-bold text-brand-text uppercase tracking-tight">Vault is Empty</h3>
                            <p className="text-brand-accent/40 text-xs font-bold uppercase tracking-widest mt-2 max-w-xs leading-relaxed">
                                Initialize storage by uploading files or creating secure sub-folders.
                            </p>
                        </div>
                    )} */}
                    {content.folders.length === 0 && content.files.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <h3 className="text-xl font-bold text-brand-text uppercase tracking-tight">Directory is Empty</h3>
                            <p className="text-brand-accent/40 text-xs font-bold uppercase tracking-widest mt-2 max-w-xs leading-relaxed">
                                Initialize directory by uploading files or creating sub-folders.
                            </p>
                        </div>
                    )}

                    {/* Folders Grid */}
                    {content.folders.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {content.folders.map(folder => (
                                <div
                                    key={folder._id}
                                    className="group relative bg-brand-surface/40 border border-brand-accent/5 rounded-2xl p-5 hover:bg-brand-surface hover:border-brand-accent/30 hover:shadow-2xl hover:shadow-black transition-all cursor-pointer flex items-center justify-between"
                                    onClick={() => handleFolderClick(folder._id)}
                                    onContextMenu={(e) => handleContextMenu(e, 'folder', folder._id, folder.name)}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, 'folder', folder._id, folder.name)}
                                    onDragOver={onDragOver}
                                    onDrop={(e) => onDrop(e, folder._id)}
                                >
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className="bg-brand-muted/20 p-3 rounded-xl group-hover:bg-brand-accent group-hover:text-brand-bg transition-all shadow-inner">
                                            <Folder size={24} className="fill-current" />
                                        </div>
                                        <span className="font-bold text-brand-text truncate text-sm uppercase tracking-wide">{folder.name}</span>
                                    </div>
                                    <button
                                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-brand-muted/20 rounded-xl transition-all text-brand-accent/40 hover:text-brand-accent"
                                        onClick={(e) => { e.stopPropagation(); handleContextMenu(e as any, 'folder', folder._id, folder.name); }}
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Files Grid */}
                    {content.files.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h2 className="text-[10px] font-black text-brand-accent/40 uppercase tracking-[0.4em]">Encrypted Payloads</h2>
                                <div className="h-px bg-brand-accent/5 flex-1" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                {content.files.map(file => (
                                    <div
                                        key={file._id}
                                        className="group relative bg-brand-surface/20 border border-brand-accent/5 rounded-3xl p-6 hover:bg-brand-surface/60 hover:border-brand-accent/20 hover:shadow-2xl transition-all cursor-pointer text-center flex flex-col items-center gap-4"
                                        onContextMenu={(e) => handleContextMenu(e, 'file', file._id, file.name)}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, 'file', file._id, file.name)}
                                    >
                                        <div className="relative">
                                            <div className="bg-brand-muted/10 p-5 rounded-[1.5rem] group-hover:bg-brand-accent group-hover:text-brand-bg transition-all shadow-inner">
                                                {React.createElement(getFileIcon(file.name, file.mimeType), { size: 32 })}
                                            </div>
                                        </div>
                                        <div className="space-y-1 w-full overflow-hidden">
                                            <span className="text-xs font-bold text-brand-text truncate block">{file.name}</span>
                                            <span className="text-[9px] font-bold text-brand-accent/30 uppercase tracking-tighter">Encrypted Blob</span>
                                        </div>

                                        <button
                                            className="absolute top-3 right-3 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-brand-muted/20 rounded-lg text-brand-accent/40 hover:text-brand-accent transition-all"
                                            onClick={(e) => { e.stopPropagation(); handleContextMenu(e as any, 'file', file._id, file.name); }}
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Custom Context Menu */}
            {contextMenu && (
                <div
                    className="fixed z-50 bg-brand-surface shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-brand-accent/10 rounded-2xl py-2 w-56 overflow-hidden animate-in fade-in zoom-in duration-200"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-4 py-2 border-b border-brand-accent/5 mb-1">
                        <p className="text-[9px] font-black text-brand-accent/40 uppercase tracking-widest truncate">{contextMenu.item?.name}</p>
                    </div>
                    {contextMenu.item?.type === 'file' && (
                        <button
                            onClick={handleDownload}
                            className="w-full flex items-center gap-4 px-4 py-3 text-xs font-bold text-brand-text/80 hover:bg-brand-accent hover:text-brand-bg transition-all"
                        >
                            <Download size={16} /> DOWNLOAD
                        </button>
                    )}
                    <button
                        onClick={handleMoveClick}
                        className="w-full flex items-center gap-4 px-4 py-3 text-xs font-bold text-brand-text/80 hover:bg-brand-accent hover:text-brand-bg transition-all"
                    >
                        <Move size={16} /> MOVE
                    </button>
                    <button
                        onClick={handleDelete}
                        className="w-full flex items-center gap-4 px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all"
                    >
                        <Trash2 size={16} /> DELETE
                    </button>
                </div>
            )}
            {notification && (
                <Toast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <MoveDialog
                open={isMoveDialogOpen}
                onClose={() => {
                    setIsMoveDialogOpen(false);
                    setMoveItem(null);
                }}
                item={moveItem}
                currentFolderId={currentFolderId}
                onSuccess={() => {
                    refreshContent();
                    setNotification({ message: 'Moved successfully', type: 'success' });
                }}
            />
        </div>
    );
};
