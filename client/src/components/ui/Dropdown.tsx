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
          absolute z-50 mt-2 w-56 rounded-xl bg-brand-surface shadow-2xl ring-1 ring-brand-accent/10 focus:outline-none py-1.5 border border-brand-accent/5
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
        flex w-full items-center px-4 py-2.5 text-sm text-left transition-colors font-medium
        ${variant === 'danger' ? 'text-red-400 hover:bg-red-500/10' : 'text-brand-text/80 hover:bg-brand-muted/20 hover:text-brand-text'}
      `}
        >
            {children}
        </button>
    );
};
