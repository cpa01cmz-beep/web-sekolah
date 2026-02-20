import { logger } from './logger';
import { PasswordConfig } from './config/security';

const {
  PBKDF2_ITERATIONS,
  SALT_LENGTH,
  HASH_LENGTH,
  ALGORITHM,
  HASH_ALGORITHM,
} = PasswordConfig;

export interface PasswordHash {
  salt: string;
  hash: string;
}

export interface HashedPassword {
  hash: string;
}

async function generateSalt(): Promise<string> {
  const salt = new Uint8Array(SALT_LENGTH);
  crypto.getRandomValues(salt);
  return bufferToHex(salt);
}

async function deriveKey(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: ALGORITHM },
    false,
    ['deriveBits']
  );

  const saltBuffer = hexToBuffer(salt);

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: ALGORITHM,
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: HASH_ALGORITHM,
    },
    keyMaterial,
    HASH_LENGTH * 8
  );

  const hash = new Uint8Array(derivedBits);
  return bufferToHex(hash);
}

function bufferToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

function constantTimeCompare(a: string, b: string): boolean {
  const aBuffer = new TextEncoder().encode(a);
  const bBuffer = new TextEncoder().encode(b);
  
  const maxLen = Math.max(aBuffer.length, bBuffer.length);
  let result = aBuffer.length ^ bBuffer.length;
  
  for (let i = 0; i < maxLen; i++) {
    const aByte = i < aBuffer.length ? aBuffer[i] : 0;
    const bByte = i < bBuffer.length ? bBuffer[i] : 0;
    result |= aByte ^ bByte;
  }
  return result === 0;
}

export async function hashPassword(password: string): Promise<HashedPassword> {
  const salt = await generateSalt();
  const hash = await deriveKey(password, salt);
  const storedHash = `${salt}:${hash}`;
  
  logger.debug('[Password] Password hashed', { 
    saltLength: salt.length, 
    hashLength: hash.length 
  });
  
  return { hash: storedHash };
}

export async function verifyPassword(
  password: string, 
  storedHash: string | null | undefined
): Promise<boolean> {
  if (!storedHash) {
    logger.warn('[Password] No stored hash found');
    return false;
  }

  if (!password || password.length === 0) {
    logger.warn('[Password] Empty password provided');
    return false;
  }

  try {
    const [salt, expectedHash] = storedHash.split(':');

    if (!salt || !expectedHash) {
      logger.error('[Password] Invalid stored hash format');
      return false;
    }

    const actualHash = await deriveKey(password, salt);
    const isValid = constantTimeCompare(actualHash, expectedHash);

    if (isValid) {
      logger.debug('[Password] Password verified successfully');
    } else {
      logger.warn('[Password] Password verification failed');
    }

    return isValid;
  } catch (error) {
    logger.error('[Password] Error verifying password', error);
    return false;
  }
}

export function getDefaultPasswordHash(): string {
  return '';
}

export function isValidPasswordHashFormat(hash: string): boolean {
  if (!hash) return false;
  const parts = hash.split(':');
  return parts.length === 2 && 
         parts[0].length === SALT_LENGTH * 2 && 
         parts[1].length === HASH_LENGTH * 2;
}
