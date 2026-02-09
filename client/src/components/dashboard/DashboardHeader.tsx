import React from 'react';
import { Plus, Upload, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

interface DashboardHeaderProps {
    title: string;
    showBack: boolean;
    onBack: () => void;
    onNewFolder: () => void;
    onUpload: () => void;
    isUploading: boolean;
    children?: React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    title,
    showBack,
    onBack,
    onNewFolder,
    onUpload,
    isUploading,
    children
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-brand-accent/10">
            <div className="space-y-4 max-w-full overflow-hidden">
                {children}
                <h1 className="text-4xl md:text-5xl font-black text-brand-text uppercase tracking-tighter leading-none">
                    {title}
                </h1>
            </div>

            <div className="flex items-center gap-3">
                {showBack && (
                    <Button variant="ghost" onClick={onBack} className="hidden sm:inline-flex">
                        <ArrowLeft size={18} className="mr-2" /> Back
                    </Button>
                )}
                <Button variant="outline" onClick={onNewFolder}>
                    <Plus size={18} className="mr-2" /> New Folder
                </Button>
                <Button onClick={onUpload} isLoading={isUploading} className="shadow-[0_0_20px_rgba(198,172,143,0.3)]">
                    {!isUploading && <Upload size={18} className="mr-2" />}
                    {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
            </div>
        </div>
    );
};
