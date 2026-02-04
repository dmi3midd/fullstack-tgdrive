import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    passwordHash: string;
    encryptedBotToken: string;
    encryptedChatId: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    encryptedBotToken: { type: String, required: true },
    encryptedChatId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});


export const User = model<IUser>('User', userSchema);