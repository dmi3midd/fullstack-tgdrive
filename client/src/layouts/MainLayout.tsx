import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Folder, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Dropdown, DropdownItem } from '../components/ui/Dropdown';

export const MainLayout: React.FC = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { text: 'My Files', icon: <Folder size={20} />, path: '/' },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-brand-surface border-r border-brand-accent/10">
            <div className="p-8 flex items-center gap-3">
                <div className="bg-brand-accent p-2.5 rounded-2xl shadow-[0_0_20px_rgba(198,172,143,0.2)]">
                    <Folder className="text-brand-bg fill-brand-bg/20" size={24} />
                </div>
                <span className="text-2xl font-black text-brand-text tracking-tight uppercase">
                    TG Drive
                </span>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.text}
                        to={item.path}
                        className={({ isActive }) => `
              flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300
              ${isActive
                                ? 'bg-brand-accent text-brand-bg font-bold shadow-xl shadow-black/20'
                                : 'text-brand-text/60 hover:bg-brand-muted/20 hover:text-brand-text'}
            `}
                    >
                        {item.icon}
                        <span className="uppercase tracking-widest text-xs font-bold">{item.text}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-6 mt-auto">
                <NavLink
                    to="/settings"
                    className={({ isActive }) => `
            flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all
            ${isActive ? 'bg-brand-accent text-brand-bg font-bold' : 'text-brand-text/60 hover:bg-brand-muted/20 hover:text-brand-text'}
          `}
                >
                    <Settings size={20} />
                    <span className="uppercase tracking-widest text-xs font-bold">Settings</span>
                </NavLink>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-20 bg-brand-bg/80 backdrop-blur-xl border-b border-brand-accent/5 z-30 flex items-center justify-between px-6 lg:px-12">
                <div className="flex items-center gap-4">
                    <button
                        className="lg:hidden p-2 text-brand-accent hover:bg-brand-surface rounded-xl transition-all"
                        onClick={() => setIsMobileOpen(true)}
                    >
                        <Menu size={26} />
                    </button>

                    <div className="lg:hidden flex items-center gap-3">
                        <Folder className="text-brand-accent" size={26} />
                        <span className="font-black text-brand-text uppercase tracking-tight">TG Drive</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <Dropdown
                        trigger={
                            <button className="flex items-center gap-3 p-2 rounded-2xl hover:bg-brand-surface transition-all border border-transparent hover:border-brand-accent/20">
                                <div className="w-9 h-9 rounded-xl bg-brand-accent text-brand-bg flex items-center justify-center font-black text-lg shadow-lg">
                                    {user?.email?.[0]?.toUpperCase()}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-xs font-bold text-brand-text/40 uppercase tracking-tighter">Authorized as</p>
                                    <p className="text-sm font-bold text-brand-text truncate max-w-[180px]">{user?.email}</p>
                                </div>
                            </button>
                        }
                    >
                        <div className="px-5 py-3 border-b border-brand-accent/5 sm:hidden">
                            <p className="text-[10px] text-brand-accent uppercase font-black tracking-[0.2em] mb-1">Account</p>
                            <p className="text-sm font-bold text-brand-text truncate">{user?.email}</p>
                        </div>
                        <DropdownItem onClick={() => navigate('/settings')}>
                            <Settings size={18} className="mr-3 text-brand-accent" /> Settings
                        </DropdownItem>
                        <DropdownItem onClick={handleLogout} variant="danger">
                            <LogOut size={18} className="mr-3" /> Logout
                        </DropdownItem>
                    </Dropdown>
                </div>
            </header>

            {/* Desktop Sidebar */}
            <aside className="fixed top-0 left-0 bottom-0 w-72 hidden lg:block z-40">
                <SidebarContent />
            </aside>

            {/* Mobile Drawer */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsMobileOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-80 bg-brand-bg border-r border-brand-accent/10 transition-transform duration-500 shadow-2xl">
                        <button
                            className="absolute top-6 right-6 p-2 text-brand-accent hover:bg-brand-surface rounded-xl transition-all"
                            onClick={() => setIsMobileOpen(false)}
                        >
                            <X size={24} />
                        </button>
                        <SidebarContent />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="lg:pl-72 pt-20 min-h-screen">
                <div className="container mx-auto px-6 py-8 lg:px-12 lg:py-12">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
