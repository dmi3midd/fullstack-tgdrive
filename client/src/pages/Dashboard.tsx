import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CreateFolderDialog } from '../components/CreateFolderDialog';
import { Spinner } from '../components/ui/Spinner';
import { Toast } from '../components/ui/Toast';
import { MoveDialog } from '../components/MoveDialog';
import { useStorage } from '../hooks/useStorage';
import { useDashboardActions } from '../hooks/useDashboardActions';
import { Breadcrumbs } from '../components/dashboard/Breadcrumbs';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { UploadProgress } from '../components/dashboard/UploadProgress';
import { FolderGrid } from '../components/dashboard/FolderGrid';
import { FileGrid } from '../components/dashboard/FileGrid';
import { ContextMenu } from '../components/dashboard/ContextMenu';

export const Dashboard: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const currentFolderId = searchParams.get('folderId');

    const { content, isLoading, refreshContent } = useStorage(currentFolderId);

    const {
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
        onDrop
    } = useDashboardActions(currentFolderId, refreshContent);

    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

    const handleFolderClick = (id: string | null) => {
        if (id) {
            setSearchParams({ folderId: id });
        } else {
            setSearchParams({});
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

            <DashboardHeader
                title={currentFolderId && content.path.length > 0
                    ? content.path[content.path.length - 1].name
                    : 'My Storage'}
                showBack={!!currentFolderId}
                onBack={() => navigate(-1)}
                onNewFolder={() => setIsCreateFolderOpen(true)}
                onUpload={triggerUpload}
                isUploading={isUploading}
            >
                <Breadcrumbs
                    path={content.path}
                    onFolderClick={handleFolderClick}
                />
            </DashboardHeader>

            {isUploading && <UploadProgress progress={uploadProgress} />}

            {isLoading && !isUploading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6 bg-brand-surface/20 rounded-3xl border border-brand-accent/5">
                    <Spinner size="lg" />
                    <p className="text-brand-accent/40 font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing...</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {content.folders.length === 0 && content.files.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <h3 className="text-xl font-bold text-brand-text uppercase tracking-tight">Directory is Empty</h3>
                            <p className="text-brand-accent/40 text-xs font-bold uppercase tracking-widest mt-2 max-w-xs leading-relaxed">
                                Initialize directory by uploading files or creating sub-folders.
                            </p>
                        </div>
                    )}

                    <FolderGrid
                        folders={content.folders}
                        onFolderClick={handleFolderClick}
                        onContextMenu={handleContextMenu}
                        onDragStart={onDragStart}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                    />

                    <FileGrid
                        files={content.files}
                        onContextMenu={handleContextMenu}
                        onDragStart={onDragStart}
                    />
                </div>
            )}

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    item={contextMenu.item}
                    onDownload={handleDownload}
                    onMove={handleMoveClick}
                    onDelete={handleDelete}
                />
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

