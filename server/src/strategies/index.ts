import { IEncryptionStrategy } from './interfaces';
import { AesCbcStrategy } from './aes-cbc.strategy';
import { AesGcmStrategy } from './aes-gcm.strategy';
import { ChaCha20Strategy } from './chacha20.strategy';
import { EncryptionContext } from './encryption.context';

type StrategyName = 'aes-cbc' | 'aes-gcm' | 'chacha20';

const strategyMap: Record<StrategyName, () => IEncryptionStrategy> = {
    'aes-cbc': () => new AesCbcStrategy(),
    'aes-gcm': () => new AesGcmStrategy(),
    'chacha20': () => new ChaCha20Strategy(),
};

export function createEncryptionContext(strategyName: StrategyName): EncryptionContext {
    const factory = strategyMap[strategyName];
    if (!factory) {
        throw new Error(`Unknown encryption strategy: ${strategyName}`);
    }
    return new EncryptionContext(factory());
}
