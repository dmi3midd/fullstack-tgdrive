import crypto from 'crypto';
import { IEncryptionStrategy } from './interfaces';

export class AesCbcStrategy implements IEncryptionStrategy {
    private readonly algorithm = 'aes-256-cbc';
    private readonly ivLength = 16;

    encrypt(plaintext: string, key: string): string {
        const keyBuffer = Buffer.from(key, 'hex');
        const iv = crypto.randomBytes(this.ivLength);
        const cipher = crypto.createCipheriv(this.algorithm, keyBuffer, iv);

        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        return `${iv.toString('hex')}:${encrypted}`;
    }

    decrypt(ciphertext: string, key: string): string {
        const [ivHex, encryptedHex] = ciphertext.split(':');
        const keyBuffer = Buffer.from(key, 'hex');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(this.algorithm, keyBuffer, iv);

        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }
}
