import { IEncryptionStrategy } from ".";

export interface IEncryptionContext extends IEncryptionStrategy {
    setStrategy(strategy: IEncryptionStrategy): void;
}