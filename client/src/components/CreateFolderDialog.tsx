import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface CreateFolderDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (name: string) => Promise<void>;
}

export const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({ open, onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            await onSubmit(name);
            setName('');
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={open} onClose={onClose} title="Create New Folder">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Folder Name"
                    placeholder="New folder"
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
                        Create
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
