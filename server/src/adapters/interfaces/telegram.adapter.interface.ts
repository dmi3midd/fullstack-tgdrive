import { Stream } from 'stream';

export interface TelegramUploadResult {
    messageId: number;
    fileId: string;
}

export interface ITelegramAdapter {
    validateBot(): Promise<boolean>;
    sendTestMessage(chatId: string): Promise<boolean>;
    uploadFile(chatId: string, fileStream: Stream, fileName: string): Promise<TelegramUploadResult>;
    getFileLink(fileId: string): Promise<string>;
    getFileStream(fileId: string): Promise<Stream>;
    deleteMessage(chatId: string, messageId: number): Promise<boolean>;
}
