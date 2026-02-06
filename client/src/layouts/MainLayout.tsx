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
        <div className="flex flex-col h-full bg-white border-r border-gray-100">
            <div className="p-6 flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
                    <Folder className="text-white" size={24} />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                    TG Drive
                </span>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.text}
                        to={item.path}
                        className={({ isActive }) => `
              flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
              ${isActive
                                ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm shadow-blue-100'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            `}
                    >
                        {item.icon}
                        {item.text}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 mt-auto">
                <NavLink
                    to="/settings"
                    className={({ isActive }) => `
            flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all
            ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}
          `}
                >
                    <Settings size={20} />
                    Settings
                </NavLink>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 z-30 flex items-center justify-between px-4 lg:px-8">
                <div className="flex items-center gap-4">
                    <button
                        className="lg:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => setIsMobileOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    <div className="lg:hidden flex items-center gap-2">
                        <Folder className="text-blue-600" size={24} />
                        <span className="font-bold text-gray-900">TG Drive</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Dropdown
                        trigger={
                            <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                    {user?.email?.[0]?.toUpperCase()}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">{user?.email}</p>
                                </div>
                            </button>
                        }
                    >
                        <div className="px-4 py-2 border-b border-gray-50 sm:hidden">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Account</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                        </div>
                        <DropdownItem onClick={() => navigate('/settings')}>
                            <Settings size={16} className="mr-2" /> Settings
                        </DropdownItem>
                        <DropdownItem onClick={handleLogout} variant="danger">
                            <LogOut size={16} className="mr-2" /> Logout
                        </DropdownItem>
                    </Dropdown>
                </div>
            </header>

            {/* Desktop Sidebar */}
            <aside className="fixed top-0 left-0 bottom-0 w-64 hidden lg:block z-40">
                <SidebarContent />
            </aside>

            {/* Mobile Drawer */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-72 bg-white transition-transform duration-300">
                        <button
                            className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
                            onClick={() => setIsMobileOpen(false)}
                        >
                            <X size={20} />
                        </button>
                        <SidebarContent />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="lg:pl-64 pt-16 min-h-screen">
                <div className="container mx-auto p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
