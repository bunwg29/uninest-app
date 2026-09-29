import * as Crypto from 'expo-crypto';

export const generateClientMessageId = (): string => Crypto.randomUUID();
