import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Content */}
            <div className="relative w-full max-w-md bg-brand-surface rounded-2xl shadow-2xl transition-all scale-100 p-8 border border-brand-accent/10">
                <div className="flex items-center justify-between mb-6">
                    {title && <h3 className="text-xl font-bold text-brand-text tracking-tight">{title}</h3>}
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-brand-muted/20 text-brand-accent/60 hover:text-brand-accent transition-all active:scale-95"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="text-brand-text/90">
                    {children}
                </div>
            </div>
        </div>
    );
};
