import React from 'react';
import { Outlet } from 'react-router-dom';
import { Folder } from 'lucide-react';

export const AuthLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-brand-surface p-4 rounded-3xl shadow-2xl border border-brand-accent/20">
                        <Folder className="text-brand-accent h-10 w-10 fill-brand-accent/20" />
                    </div>
                </div>
                <h2 className="mt-8 text-center text-4xl font-black text-brand-text tracking-tight uppercase">
                    TG Drive
                </h2>
                <p className="mt-3 text-center text-sm text-brand-accent font-bold uppercase tracking-[0.2em] opacity-80">
                    Storage via Telegram
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-brand-surface py-10 px-4 shadow-2xl shadow-black sm:rounded-3xl sm:px-12 border border-brand-accent/10">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};
