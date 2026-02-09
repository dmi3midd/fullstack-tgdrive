import React from 'react';
import { Download, Move, Trash2 } from 'lucide-react';

interface ContextMenuProps {
    x: number;
    y: number;
    item: { type: 'file' | 'folder', id: string, name: string } | null;
    onDownload: () => void;
    onMove: () => void;
    onDelete: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
    x,
    y,
    item,
    onDownload,
    onMove,
    onDelete
}) => {
    return (
        <div
            className="fixed z-50 bg-brand-surface shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-brand-accent/10 rounded-2xl py-2 w-56 overflow-hidden animate-in fade-in zoom-in duration-200"
            style={{ top: y, left: x }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="px-4 py-2 border-b border-brand-accent/5 mb-1">
                <p className="text-[9px] font-black text-brand-accent/40 uppercase tracking-widest truncate">{item?.name}</p>
            </div>
            {item?.type === 'file' && (
                <button
                    onClick={onDownload}
                    className="w-full flex items-center gap-4 px-4 py-3 text-xs font-bold text-brand-text/80 hover:bg-brand-accent hover:text-brand-bg transition-all"
                >
                    <Download size={16} /> DOWNLOAD
                </button>
            )}
            <button
                onClick={onMove}
                className="w-full flex items-center gap-4 px-4 py-3 text-xs font-bold text-brand-text/80 hover:bg-brand-accent hover:text-brand-bg transition-all"
            >
                <Move size={16} /> MOVE
            </button>
            <button
                onClick={onDelete}
                className="w-full flex items-center gap-4 px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all"
            >
                <Trash2 size={16} /> DELETE
            </button>
        </div>
    );
};
