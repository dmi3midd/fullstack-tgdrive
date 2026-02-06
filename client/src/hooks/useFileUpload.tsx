import React, { useRef } from 'react';

export const useFileUpload = (onUpload: (files: FileList) => Promise<void>) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const triggerUpload = () => {
        inputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onUpload(e.target.files);
        }
        // Reset input
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const HiddenInput = () => (
        <input
            type="file"
            ref={inputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            multiple
        />
    );

    return { triggerUpload, HiddenInput };
};
