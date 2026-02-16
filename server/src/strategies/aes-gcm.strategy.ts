import crypto from 'crypto';
import { IEncryptionStrategy } from './interfaces';

export class AesGcmStrategy implements IEncryptionStrategy {
    private readonly algorithm = 'aes-256-gcm';
    private readonly ivLength = 12;
    private readonly authTagLength = 16;

    encrypt(plaintext: string, key: string): string {
        const keyBuffer = Buffer.from(key, 'hex');
        const iv = crypto.randomBytes(this.ivLength);
        const cipher = crypto.createCipheriv(this.algorithm, keyBuffer, iv, {
            authTagLength: this.authTagLength,
        });

        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();

        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }

    decrypt(ciphertext: string, key: string): string {
        const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':');
        const keyBuffer = Buffer.from(key, 'hex');
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv(this.algorithm, keyBuffer, iv, {
            authTagLength: this.authTagLength,
        });
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }
}
