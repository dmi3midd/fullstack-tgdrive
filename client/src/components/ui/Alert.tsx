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
        info: 'bg-blue-50 text-blue-800 border-blue-200',
        success: 'bg-green-50 text-green-800 border-green-200',
        warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        error: 'bg-red-50 text-red-800 border-red-200',
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
