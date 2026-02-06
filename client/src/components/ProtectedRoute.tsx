import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Spinner } from './ui/Spinner';

export const ProtectedRoute: React.FC = () => {
    const { isAuth, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-bg">
                <div className="text-center space-y-6">
                    <Spinner size="lg" />
                    <p className="text-brand-accent/40 text-[10px] font-black uppercase tracking-[0.4em]">Verifying Authentication...</p>
                </div>
            </div>
        );
    }

    return isAuth ? <Outlet /> : <Navigate to="/login" />;
};
