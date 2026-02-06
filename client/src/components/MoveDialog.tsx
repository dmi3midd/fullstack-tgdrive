import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Spinner } from './ui/Spinner';
import { Folder, ChevronRight, ChevronDown, Search, FolderOpen } from 'lucide-react';
import { foldersApi } from '../api/folders';
import { filesApi } from '../api/files';

interface MoveDialogProps {
    open: boolean;
    onClose: () => void;
    item: { type: 'file' | 'folder'; id: string; name: string } | null;
    currentFolderId: string | null;
    onSuccess: () => void;
}

interface FolderNode {
    _id: string;
    name: string;
    parentFolderId: string | null;
    children: FolderNode[];
}

export const MoveDialog: React.FC<MoveDialogProps> = ({ open, onClose, item, currentFolderId, onSuccess }) => {
    const [tree, setTree] = useState<FolderNode[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));

    useEffect(() => {
        if (open) {
            loadTree();
            setSelectedFolderId(currentFolderId);
        }
    }, [open, currentFolderId]);

    const loadTree = async () => {
        setIsLoading(true);
        try {
            const data = await foldersApi.getTree();
            setTree(data);
        } catch (error) {
            console.error('Failed to load folder tree', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const next = new Set(expandedFolders);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setExpandedFolders(next);
    };

    // Calculate which folders are descendants of the current item (if it's a folder)
    const descendantIds = useMemo(() => {
        if (!item || item.type !== 'folder') return new Set<string>();

        const ids = new Set<string>();
        const findDescendants = (nodes: FolderNode[]) => {
            for (const node of nodes) {
                if (node._id === item.id || ids.has(node.parentFolderId || '')) {
                    ids.add(node._id);
                }
                if (node.children.length > 0) {
                    findDescendants(node.children);
                }
            }
        };
        // This simple traversal might miss some if children are visited before parent
        // Let's do a more robust one
        const allNodesMap = new Map<string, FolderNode>();
        const mapNodes = (nodes: FolderNode[]) => {
            nodes.forEach(n => {
                allNodesMap.set(n._id, n);
                mapNodes(n.children);
            });
        };
        mapNodes(tree);

        const result = new Set<string>();
        result.add(item.id);

        let changed = true;
        while (changed) {
            changed = false;
            for (const [id, node] of allNodesMap) {
                if (node.parentFolderId && result.has(node.parentFolderId) && !result.has(id)) {
                    result.add(id);
                    changed = true;
                }
            }
        }
        return result;
    }, [tree, item]);

    const handleMove = async () => {
        if (!item) return;
        setIsMoving(true);
        try {
            if (item.type === 'file') {
                await filesApi.move(item.id, selectedFolderId);
            } else {
                await foldersApi.move(item.id, selectedFolderId);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to move item', error);
        } finally {
            setIsMoving(false);
        }
    };

    const renderTreeItem = (node: FolderNode | { _id: null, name: string, children: FolderNode[] }, depth: number) => {
        const id = node._id || 'root';
        const isSelected = selectedFolderId === node._id;
        const isExpanded = expandedFolders.has(id);
        const hasChildren = node.children && node.children.length > 0;
        const isDisabled = item?.type === 'folder' && node._id && descendantIds.has(node._id);
        const isCurrentParent = node._id === currentFolderId;

        // Simple search filtering
        if (searchQuery && node._id !== null && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            // If it doesn't match, check if any children match
            const hasMatchingChild = (n: FolderNode): boolean => {
                if (n.name.toLowerCase().includes(searchQuery.toLowerCase())) return true;
                return n.children.some(hasMatchingChild);
            };
            if (!node.children.some(hasMatchingChild)) return null;
        }

        return (
            <div key={id} className="select-none">
                <div
                    onClick={() => !isDisabled && setSelectedFolderId(node._id)}
                    className={`flex items-center gap-2 py-2 px-3 rounded-xl cursor-pointer transition-all
                        ${isSelected ? 'bg-brand-accent text-brand-bg shadow-lg shadow-brand-accent/20' : 'hover:bg-brand-muted/20'}
                        ${isDisabled ? 'opacity-30 cursor-not-allowed grayscale' : ''}
                    `}
                    style={{ marginLeft: `${depth * 12}px` }}
                >
                    <div className="w-6 h-6 flex items-center justify-center">
                        {hasChildren ? (
                            <button
                                onClick={(e) => toggleExpand(id, e)}
                                className="p-1 hover:bg-black/10 rounded-md transition-colors"
                            >
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                        ) : (
                            <div className="w-3.5" />
                        )}
                    </div>
                    {isSelected ? <FolderOpen size={18} className="shrink-0" /> : <Folder size={18} className="shrink-0 opacity-60" />}
                    <span className="text-sm font-bold truncate uppercase tracking-tight">
                        {node.name}
                        {isCurrentParent && node._id !== null && <span className="ml-2 text-[10px] opacity-40">(Current)</span>}
                    </span>
                </div>
                {isExpanded && node.children.map(child => renderTreeItem(child, depth + 1))}
            </div>
        );
    };

    return (
        <Modal isOpen={open} onClose={onClose} title={`Move ${item?.name || 'Item'}`}>
            <div className="space-y-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-accent/30" size={16} />
                    <Input
                        placeholder="Search folders..."
                        className="pl-11"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="bg-brand-surface/50 border border-brand-accent/5 rounded-2xl p-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="py-12 flex flex-col items-center gap-4">
                            <Spinner size="md" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-accent/40">Mapping Structure...</p>
                        </div>
                    ) : (
                        renderTreeItem({ _id: null, name: 'Root Directory', children: tree }, 0)
                    )}
                </div>

                <div className="flex justify-between items-center bg-brand-bg/50 p-4 rounded-2xl border border-brand-accent/5">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-brand-accent/30">Target Destination</p>
                        <p className="text-xs font-bold text-brand-text truncate max-w-[200px]">
                            {selectedFolderId === null ? 'Root Directory' : (
                                tree.find(f => f._id === selectedFolderId)?.name ||
                                // This won't find nested ones easily, maybe just show it if we find it
                                'Selected Folder'
                            )}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose} disabled={isMoving}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleMove}
                            isLoading={isMoving}
                            disabled={selectedFolderId === currentFolderId || isLoading}
                            className="shadow-xl shadow-brand-accent/10"
                        >
                            Move Here
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
