import React, { useEffect, useRef } from 'react';
import { Download, Move, Trash2, X } from 'lucide-react';

interface ContextMenuProps {
    x: number;
    y: number;
    item: { type: 'file' | 'folder', id: string, name: string } | null;
    onDownload: () => void;
    onMove: () => void;
    onDelete: () => void;
    onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
    x,
    y,
    item,
    onDownload,
    onMove,
    onDelete,
    onClose
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        // Use capture phase to ensure we catch it before other element's click handlers might stop propagation
        // though normally bubbling is fine if we just want to close on ANY click elsewhere.
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="fixed z-50 bg-brand-surface shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-brand-accent/10 rounded-2xl py-2 w-56 overflow-hidden animate-in fade-in zoom-in duration-200"
            style={{ top: y, left: x }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="px-4 py-2 border-b border-brand-accent/5 mb-1 flex items-center justify-between">
                <p className="text-[9px] font-black text-brand-accent/40 uppercase tracking-widest truncate">{item?.name}</p>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-brand-muted/20 rounded-lg text-brand-accent/40 hover:text-brand-accent transition-all"
                >
                    <X size={12} />
                </button>
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
