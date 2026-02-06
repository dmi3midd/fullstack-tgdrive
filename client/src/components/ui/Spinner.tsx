import React from 'react';

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizes = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4',
    };

    return (
        <div className={`${sizes[size]} animate-spin rounded-full border-brand-accent border-t-transparent shadow-[0_0_15px_rgba(198,172,143,0.3)]`} />
    );
};
