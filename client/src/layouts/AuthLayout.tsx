import React from 'react';
import { Outlet } from 'react-router-dom';
import { Folder } from 'lucide-react';

export const AuthLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-blue-600 p-3 rounded-2xl shadow-lg">
                        <Folder className="text-white h-10 w-10" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                    TG Drive
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 font-medium">
                    Cloud storage powered by Telegram
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};
