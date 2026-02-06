import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface ToastProps {
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
    message,
    type = 'info',
    duration = 5000,
    onClose
}) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const styles = {
        info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        success: 'bg-green-500/10 text-green-400 border-green-500/20',
        warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        error: 'bg-red-500/10 text-red-100 border-red-500/20',
    };

    const icons = {
        info: <Info size={18} />,
        success: <CheckCircle size={18} />,
        warning: <AlertTriangle size={18} />,
        error: <AlertCircle size={18} />,
    };

    return (
        <div className={`
      fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-4 py-3 
      rounded-2xl border backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300
      ${styles[type]}
    `}>
            <div className="shrink-0">{icons[type]}</div>
            <p className="text-sm font-bold tracking-tight">{message}</p>
            <button
                onClick={onClose}
                className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors opacity-50 hover:opacity-100"
            >
                <X size={16} />
            </button>
        </div>
    );
};
