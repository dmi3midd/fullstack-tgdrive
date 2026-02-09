import React from 'react';

interface UploadProgressProps {
    progress: number;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ progress }) => {
    return (
        <div className="bg-brand-surface border border-brand-accent/20 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between text-[10px] mb-3 font-black uppercase tracking-widest text-brand-accent">
                <span>Encrypting & Uploading...</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-brand-muted/20 rounded-full h-1.5 overflow-hidden">
                <div
                    className="bg-brand-accent h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(198,172,143,0.5)]"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};
