import { Schema, model, Document, Types } from 'mongoose';

export interface IFolder extends Document {
    ownerId: Types.ObjectId;
    name: string;
    parentFolderId: Types.ObjectId | null;
}

const folderSchema = new Schema<IFolder>({
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    parentFolderId: { type: Schema.Types.ObjectId, ref: 'Folder', default: null, index: true },
}, {
    timestamps: true,
});

folderSchema.index({ ownerId: 1, parentFolderId: 1, name: 1 }, { unique: true });

export const Folder = model<IFolder>('Folder', folderSchema);