import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Spinner } from './ui/Spinner';

export const ProtectedRoute: React.FC = () => {
    const { isAuth, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <Spinner size="lg" />
                    <p className="text-gray-500 font-medium">Verifying session...</p>
                </div>
            </div>
        );
    }

    return isAuth ? <Outlet /> : <Navigate to="/login" />;
};
