import {
    FileAudio,
    FileVideo,
    FileImage,
    FileText,
    FileCode,
    Archive,
    FileIcon,
    FileSpreadsheet,
    Presentation
} from "lucide-react";

export const getFileIcon = (fileName: string, mimeType?: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    // Audio
    if (
        ['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg', 'wma', 'aiff', 'alac'].includes(extension || '') ||
        mimeType?.startsWith('audio/')
    ) {
        return FileAudio;
    }
    // Video
    if (
        ['mp4', 'mkv', 'avi', 'mov', 'webm', 'flv', 'wmv', 'm4v'].includes(extension || '') ||
        mimeType?.startsWith('video/')
    ) {
        return FileVideo;
    }
    // Images
    if (
        ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico', 'heic', 'heif', 'tif', 'tiff'].includes(extension || '') ||
        mimeType?.startsWith('image/')
    ) {
        return FileImage;
    }

    // Spreadsheets
    if (['xls', 'xlsx', 'csv', 'ods'].includes(extension || '')) {
        return FileSpreadsheet;
    }

    // Presentations
    if (['ppt', 'pptx', 'odp'].includes(extension || '')) {
        return Presentation;
    }
    // Documents / Text
    if (
        ['pdf', 'doc', 'docx', 'txt', 'md', 'markdown', 'odt', 'rtf'].includes(extension || '') ||
        mimeType === 'application/pdf' ||
        mimeType?.startsWith('text/')
    ) {
        return FileText;
    }
    // Archives
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso'].includes(extension || '')) {
        return Archive;
    }
    // Code
    if (
        ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'rb', 'go', 'rs', 'php', 'sh', 'sql', 'yml', 'yaml', 'xml', 'c', 'cpp', 'h', 'hpp', 'cs', 'java', 'kt', 'kts', 'swift', 'dart', 'r',].includes(extension || '')
    ) {
        return FileCode;
    }

    // Default
    return FileIcon;
};