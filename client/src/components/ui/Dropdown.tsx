import React, { useState, useRef, useEffect } from 'react';

interface DropdownProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    align?: 'left' | 'right';
}

export const Dropdown: React.FC<DropdownProps> = ({ trigger, children, align = 'right' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

            {isOpen && (
                <div className={`
          absolute z-50 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1
          ${align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'}
        `}>
                    {children}
                </div>
            )}
        </div>
    );
};

export const DropdownItem: React.FC<{
    onClick?: () => void;
    children: React.ReactNode;
    variant?: 'default' | 'danger'
}> = ({ onClick, children, variant = 'default' }) => {
    return (
        <button
            onClick={onClick}
            className={`
        flex w-full items-center px-4 py-2 text-sm text-left transition-colors
        ${variant === 'danger' ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-100'}
      `}
        >
            {children}
        </button>
    );
};
