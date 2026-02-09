import React from 'react';
import { Folder, MoreVertical } from 'lucide-react';
import type { FolderItem } from '../../types/files';

interface FolderGridProps {
    folders: FolderItem[];
    onFolderClick: (id: string) => void;
    onContextMenu: (e: React.MouseEvent, type: 'folder', id: string, name: string) => void;
    onDragStart: (e: React.DragEvent, type: 'folder', id: string, name: string) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, targetFolderId: string) => void;
}

export const FolderGrid: React.FC<FolderGridProps> = ({
    folders,
    onFolderClick,
    onContextMenu,
    onDragStart,
    onDragOver,
    onDrop
}) => {
    if (folders.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {folders.map(folder => (
                <div
                    key={folder._id}
                    className="group relative bg-brand-surface/40 border border-brand-accent/5 rounded-2xl p-5 hover:bg-brand-surface hover:border-brand-accent/30 hover:shadow-2xl hover:shadow-black transition-all cursor-pointer flex items-center justify-between"
                    onClick={() => onFolderClick(folder._id)}
                    onContextMenu={(e) => onContextMenu(e, 'folder', folder._id, folder.name)}
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
                        onClick={(e) => { e.stopPropagation(); onContextMenu(e as any, 'folder', folder._id, folder.name); }}
                    >
                        <MoreVertical size={18} />
                    </button>
                </div>
            ))}
        </div>
    );
};
