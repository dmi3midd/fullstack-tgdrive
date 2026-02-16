import crypto from 'crypto';
import { IEncryptionStrategy } from './interfaces';

export class ChaCha20Strategy implements IEncryptionStrategy {
    private readonly algorithm = 'chacha20-poly1305';
    private readonly nonceLength = 12;
    private readonly authTagLength = 16;

    encrypt(plaintext: string, key: string): string {
        const keyBuffer = Buffer.from(key, 'hex');
        const nonce = crypto.randomBytes(this.nonceLength);
        const cipher = crypto.createCipheriv(this.algorithm, keyBuffer, nonce, {
            authTagLength: this.authTagLength,
        });

        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();

        return `${nonce.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }

    decrypt(ciphertext: string, key: string): string {
        const [nonceHex, authTagHex, encryptedHex] = ciphertext.split(':');
        const keyBuffer = Buffer.from(key, 'hex');
        const nonce = Buffer.from(nonceHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv(this.algorithm, keyBuffer, nonce, {
            authTagLength: this.authTagLength,
        });
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }
}
