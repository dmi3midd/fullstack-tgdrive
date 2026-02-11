import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import type { FileItem } from '../../types/files';
import { getFileIcon } from '../../utils/getFileIcon';

interface FileGridProps {
    files: FileItem[];
    onContextMenu: (e: React.MouseEvent, type: 'file', id: string, name: string) => void;
    onDragStart: (e: React.DragEvent, type: 'file', id: string, name: string) => void;
}

export const FileGrid: React.FC<FileGridProps> = ({
    files,
    onContextMenu,
    onDragStart
}) => {
    if (files.length === 0) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <h2 className="text-[10px] font-black text-brand-accent/40 uppercase tracking-[0.4em]">Encrypted Payloads</h2>
                <div className="h-px bg-brand-accent/5 flex-1" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {files.map(file => (
                    <div
                        key={file.id}
                        className="group relative bg-brand-surface/20 border border-brand-accent/5 rounded-3xl p-6 hover:bg-brand-surface/60 hover:border-brand-accent/20 hover:shadow-2xl transition-all cursor-pointer text-center flex flex-col items-center gap-4"
                        onContextMenu={(e) => onContextMenu(e, 'file', file.id, file.name)}
                        draggable
                        onDragStart={(e) => onDragStart(e, 'file', file.id, file.name)}
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
                            onClick={(e) => { e.stopPropagation(); onContextMenu(e as any, 'file', file.id, file.name); }}
                        >
                            <MoreHorizontal size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
