import { Stream } from 'stream';
import { IFile } from '../../models/file.model';

export interface TgCredentials {
    botToken: string;
    chatId: string;
}

export interface FileDownloadResult {
    file: IFile;
    fileLink: string;
}

export interface FileStreamResult {
    file: IFile;
    stream: Stream;
}

export interface IFilesService {
    uploadFile(
        file: Express.Multer.File,
        ownerId: string,
        tgCredentials: TgCredentials,
        parentFolderId?: string | null
    ): Promise<IFile>;

    downloadFile(
        fileId: string,
        ownerId: string,
        tgCredentials: TgCredentials
    ): Promise<FileDownloadResult>;

    getFileStreamWithMetadata(
        fileId: string,
        ownerId: string,
        tgCredentials: Pick<TgCredentials, 'botToken'>
    ): Promise<FileStreamResult>;

    renameFile(fileId: string, name: string, ownerId: string): Promise<IFile | null>;
    moveFile(fileId: string, parentFolderId: string | null, ownerId: string): Promise<IFile | null>;
    deleteFile(fileId: string, ownerId: string, tgCredentials: TgCredentials): Promise<IFile>;
}
