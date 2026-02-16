export interface IEncryptionStrategy {
    encrypt(plaintext: string, key: string): string;
    decrypt(ciphertext: string, key: string): string;
}
