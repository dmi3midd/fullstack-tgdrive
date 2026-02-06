import { Schema, model, Document, Types } from 'mongoose';

export interface IFile extends Document {
    ownerId: Types.ObjectId;
    telegramMessageId: number;
    telegramFileId?: string; // Cache for downloading
    name: string;
    size: number;
    mimeType: string;
    parentFolderId: Types.ObjectId | null;
}

const fileSchema = new Schema<IFile>({
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    telegramMessageId: { type: Number, required: true },
    telegramFileId: { type: String },
    name: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    parentFolderId: { type: Schema.Types.ObjectId, ref: 'Folder', default: null, index: true },
}, {
    timestamps: true,
});

fileSchema.index({ ownerId: 1, parentFolderId: 1, name: 1 }, { unique: true });

export const File = model<IFile>('File', fileSchema);