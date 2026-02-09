import React from 'react';
import { Folder, ChevronRight } from 'lucide-react';
import type { FolderPathItem } from '../../types/files';

interface BreadcrumbsProps {
    path: FolderPathItem[];
    onFolderClick: (id: string | null) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ path, onFolderClick }) => {
    return (
        <div className="flex items-center gap-2 text-brand-accent/50 overflow-x-auto scrollbar-hide pb-1">
            <button
                onClick={() => onFolderClick(null)}
                className="hover:text-brand-text transition-all p-1.5 rounded-lg hover:bg-brand-surface shrink-0"
            >
                <Folder size={16} />
            </button>

            {path.map((item, index) => (
                <React.Fragment key={item._id}>
                    <ChevronRight size={12} className="shrink-0 opacity-30" />
                    <button
                        onClick={() => onFolderClick(item._id)}
                        className={`text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap px-2 py-1.5 rounded-lg transition-all shrink-0
                            ${index === path.length - 1
                                ? 'text-brand-accent bg-brand-accent/10 border border-brand-accent/20'
                                : 'hover:text-brand-text hover:bg-brand-surface'}`}
                    >
                        {item.name}
                    </button>
                </React.Fragment>
            ))}
        </div>
    );
};
