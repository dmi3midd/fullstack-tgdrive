import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, ...props }, ref) => {
        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label className="text-sm font-semibold text-brand-text/70 uppercase tracking-wider">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        'flex w-full rounded-xl border border-brand-accent/20 bg-brand-surface/50 px-4 py-2.5 text-sm text-brand-text ring-offset-brand-bg file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-brand-text/30 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 focus:ring-offset-brand-bg disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-inner',
                        error ? 'border-red-500 focus:ring-red-500' : 'border-brand-accent/20 focus:border-brand-accent',
                        className
                    )}
                    {...props}
                />
                {error ? (
                    <p className="text-xs text-red-500">{error}</p>
                ) : helperText ? (
                    <p className="text-xs text-gray-500">{helperText}</p>
                ) : null}
            </div>
        );
    }
);

Input.displayName = 'Input';
