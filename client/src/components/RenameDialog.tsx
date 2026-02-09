import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface RenameDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (name: string) => Promise<void>;
    initialName: string;
    type: 'file' | 'folder';
}

export const RenameDialog: React.FC<RenameDialogProps> = ({ open, onClose, onSubmit, initialName, type }) => {
    const [name, setName] = useState(initialName);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setName(initialName);
        }
    }, [open, initialName]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || name === initialName) {
            onClose();
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(name);
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={open} onClose={onClose} title={`Rename ${type === 'file' ? 'File' : 'Folder'}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="New Name"
                    placeholder={`Enter ${type} name`}
                    autoFocus
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    required
                />
                <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        Rename
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
