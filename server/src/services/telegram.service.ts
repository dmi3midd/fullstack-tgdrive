import axios from 'axios';
import FormData from 'form-data';
import { Stream } from 'stream';

export class TelegramService {
    private readonly baseUrl: string;

    constructor(private readonly botToken: string) {
        this.baseUrl = `https://api.telegram.org/bot${botToken}`;
    }

    async validateBot(): Promise<boolean> {
        try {
            const response = await axios.get(`${this.baseUrl}/getMe`);
            return response.data.ok;
        } catch (error) {
            return false;
        }
    }

    async sendTestMessage(chatId: string): Promise<boolean> {
        try {
            const response = await axios.post(`${this.baseUrl}/sendMessage`, {
                chat_id: chatId,
                text: '✅ TG-Drive: Connection established! Your private cloud is ready.',
            });
            return response.data.ok;
        } catch (error) {
            return false;
        }
    }

    async uploadFile(chatId: string, fileStream: Stream, fileName: string): Promise<{ messageId: number; fileId: string }> {
        const form = new FormData();
        form.append('chat_id', chatId);
        form.append('document', fileStream, { filename: fileName });

        const response = await axios.post(`${this.baseUrl}/sendDocument`, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });

        if (!response.data.ok) {
            throw new Error(`Telegram upload failed: ${response.data.description}`);
        }

        const { message_id, document, video, audio } = response.data.result;
        const fileMetadata = document || video || audio;

        if (!fileMetadata) {
            throw new Error('Telegram upload succeeded but no file metadata found in response');
        }

        return {
            messageId: message_id,
            fileId: fileMetadata.file_id,
        };
    }

    async getFileLink(fileId: string): Promise<string> {
        const response = await axios.get(`${this.baseUrl}/getFile`, {
            params: { file_id: fileId },
        });

        if (!response.data.ok) {
            throw new Error(`Telegram getFile failed: ${response.data.description}`);
        }

        const filePath = response.data.result.file_path;
        return `https://api.telegram.org/file/bot${this.botToken}/${filePath}`;
    }

    async deleteMessage(chatId: string, messageId: number): Promise<boolean> {
        try {
            const response = await axios.post(`${this.baseUrl}/deleteMessage`, {
                chat_id: chatId,
                message_id: messageId,
            });
            return response.data.ok;
        } catch (error) {
            console.error(`Failed to delete message ${messageId} in chat ${chatId}:`, error);
            return false;
        }
    }
}
