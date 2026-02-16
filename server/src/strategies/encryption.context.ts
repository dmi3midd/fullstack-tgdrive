import { IEncryptionStrategy } from './interfaces';
import { IEncryptionContext } from './interfaces';

export class EncryptionContext implements IEncryptionContext {
    private strategy: IEncryptionStrategy;

    constructor(strategy: IEncryptionStrategy) {
        this.strategy = strategy;
    }

    setStrategy(strategy: IEncryptionStrategy): void {
        this.strategy = strategy;
    }

    encrypt(plaintext: string, key: string): string {
        return this.strategy.encrypt(plaintext, key);
    }

    decrypt(ciphertext: string, key: string): string {
        return this.strategy.decrypt(ciphertext, key);
    }
}
