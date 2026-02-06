import React, { useEffect, useState } from 'react';
import { Folder, File as FileIcon, Upload, Plus, ChevronRight, MoreVertical, Download, Trash2, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { foldersApi } from '../api/folders';
import { filesApi } from '../api/files';
import type { FolderContentResponse } from '../types/files';
import { CreateFolderDialog } from '../components/CreateFolderDialog';
import { useFileUpload } from '../hooks/useFileUpload';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

export const Dashboard: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const currentFolderId = searchParams.get('folderId');

    const [content, setContent] = useState<FolderContentResponse>({ folders: [], files: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

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
        setIsUploading(true);
        setUploadProgress(0);
        try {
            const total = files.length;
            for (let i = 0; i < total; i++) {
                await filesApi.upload(files[i], currentFolderId);
                setUploadProgress(((i + 1) / total) * 100);
            }
            refreshContent();
        } catch (e) {
            console.error("Upload failed", e);
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

    return (
        <div className="space-y-8" onClick={() => setContextMenu(null)}>
            <HiddenInput />
            <CreateFolderDialog
                open={isCreateFolderOpen}
                onClose={() => setIsCreateFolderOpen(false)}
                onSubmit={handleCreateFolder}
            />

            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-hidden">
                    <button
                        onClick={() => setSearchParams({})}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors shrink-0"
                    >
                        <Folder size={20} className="text-blue-600" />
                    </button>
                    <ChevronRight size={16} className="text-gray-300 shrink-0" />
                    <h1 className="text-xl font-bold text-gray-900 truncate">
                        {currentFolderId ? 'Folder Content' : 'My Files'}
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    {currentFolderId && (
                        <Button variant="ghost" onClick={() => navigate(-1)} className="hidden sm:inline-flex">
                            <ArrowLeft size={18} className="mr-2" /> Back
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => setIsCreateFolderOpen(true)}>
                        <Plus size={18} className="mr-2" /> New Folder
                    </Button>
                    <Button onClick={triggerUpload} isLoading={isUploading}>
                        {!isUploading && <Upload size={18} className="mr-2" />}
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </div>
            </div>

            {isUploading && (
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between text-sm mb-2 font-medium">
                        <span>Uploading files...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {isLoading && !isUploading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Spinner size="lg" />
                    <p className="text-gray-500 font-medium">Loading your files...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Empty State */}
                    {content.folders.length === 0 && content.files.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                <Upload size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No files yet</h3>
                            <p className="text-gray-500 max-w-xs mt-1">
                                Upload your first file or create a folder to get started.
                            </p>
                        </div>
                    )}

                    {/* Folders Grid */}
                    {content.folders.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {content.folders.map(folder => (
                                <div
                                    key={folder._id}
                                    className="group relative bg-white border border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 transition-all cursor-pointer flex items-center justify-between"
                                    onClick={() => handleFolderClick(folder._id)}
                                    onContextMenu={(e) => handleContextMenu(e, 'folder', folder._id, folder.name)}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="bg-yellow-50 p-2 rounded-lg group-hover:bg-yellow-100 transition-colors">
                                            <Folder className="text-yellow-600 fill-yellow-600" size={24} />
                                        </div>
                                        <span className="font-semibold text-gray-900 truncate">{folder.name}</span>
                                    </div>
                                    <button
                                        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-gray-50 rounded-lg transition-all text-gray-400"
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
                        <div className="space-y-4">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Files</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {content.files.map(file => (
                                    <div
                                        key={file._id}
                                        className="group relative bg-white border border-gray-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer text-center flex flex-col items-center gap-3"
                                        onContextMenu={(e) => handleContextMenu(e, 'file', file._id, file.name)}
                                    >
                                        <div className="relative">
                                            <div className="bg-blue-50 p-4 rounded-2xl group-hover:bg-blue-100 transition-colors">
                                                <FileIcon className="text-blue-600" size={32} />
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 truncate w-full">{file.name}</span>

                                        <button
                                            className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-50 rounded-lg text-gray-400"
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
                    className="fixed z-50 bg-white shadow-xl shadow-gray-200/50 border border-gray-100 rounded-xl py-1 w-48 overflow-hidden"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {contextMenu.item?.type === 'file' && (
                        <button
                            onClick={handleDownload}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Download size={16} /> Download
                        </button>
                    )}
                    <button
                        onClick={handleDelete}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <Trash2 size={16} /> Delete
                    </button>
                </div>
            )}
        </div>
    );
};
