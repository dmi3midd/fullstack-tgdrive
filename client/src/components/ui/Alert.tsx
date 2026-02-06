import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
    variant?: AlertVariant;
    children: React.ReactNode;
    className?: string;
}

export const Alert: React.FC<AlertProps> = ({ variant = 'info', children, className = '' }) => {
    const styles = {
        info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        success: 'bg-green-500/10 text-green-400 border-green-500/20',
        warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        error: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    const icons = {
        info: <Info size={18} />,
        success: <CheckCircle size={18} />,
        warning: <AlertCircle size={18} />,
        error: <XCircle size={18} />,
    };

    return (
        <div className={`flex items-start gap-3 p-4 rounded-lg border ${styles[variant]} ${className}`}>
            <span className="mt-0.5">{icons[variant]}</span>
            <div className="text-sm font-medium">{children}</div>
        </div>
    );
};
