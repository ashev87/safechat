/**
 * SafeChat E2E Encryption Library
 * Uses X25519 for key exchange and XSalsa20-Poly1305 for message encryption
 * 
 * SECURITY: All encryption happens client-side. Server never sees plaintext.
 */

import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util';

export interface EncryptedMessage {
  encrypted: string;  // Base64 ciphertext
  nonce: string;      // Base64 nonce
}

export interface KeyPair {
  publicKey: string;  // Base64 public key
  secretKey: Uint8Array;  // Keep secret key in memory only
}

/**
 * SecureCrypto - E2E encryption manager
 * 
 * Each user generates a keypair on room join.
 * Shared secrets are derived via X25519 Diffie-Hellman.
 * Messages are encrypted with XSalsa20-Poly1305.
 */
export class SecureCrypto {
  private keyPair: nacl.BoxKeyPair;
  private sharedKeys: Map<string, Uint8Array> = new Map();

  constructor() {
    // Generate fresh keypair for this session
    this.keyPair = nacl.box.keyPair();
  }

  /**
   * Get public key to share with others
   */
  get publicKey(): string {
    return encodeBase64(this.keyPair.publicKey);
  }

  /**
   * Derive shared secret with another user's public key
   * Uses X25519 Diffie-Hellman
   */
  private deriveSharedKey(theirPublicKey: string): Uint8Array {
    const theirKey = decodeBase64(theirPublicKey);
    // nacl.box.before computes the shared secret
    return nacl.box.before(theirKey, this.keyPair.secretKey);
  }

  /**
   * Get or compute shared key for a peer
   */
  private getSharedKey(publicKey: string): Uint8Array {
    if (!this.sharedKeys.has(publicKey)) {
      this.sharedKeys.set(publicKey, this.deriveSharedKey(publicKey));
    }
    return this.sharedKeys.get(publicKey)!;
  }

  /**
   * Encrypt a message for a specific recipient
   * 
   * @param message - Plaintext message
   * @param recipientPublicKey - Recipient's public key (base64)
   * @returns Encrypted message with nonce
   * @throws Error if encryption fails (never falls back to plaintext!)
   */
  encrypt(message: string, recipientPublicKey: string): EncryptedMessage {
    const sharedKey = this.getSharedKey(recipientPublicKey);
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const messageBytes = decodeUTF8(message);

    const encrypted = nacl.box.after(messageBytes, nonce, sharedKey);
    
    if (!encrypted) {
      throw new Error('Encryption failed - message blocked for security');
    }

    return {
      encrypted: encodeBase64(encrypted),
      nonce: encodeBase64(nonce),
    };
  }

  /**
   * Decrypt a message from a specific sender
   * 
   * @param encrypted - Base64 ciphertext
   * @param nonce - Base64 nonce
   * @param senderPublicKey - Sender's public key (base64)
   * @returns Decrypted plaintext
   * @throws Error if decryption fails (message may be tampered)
   */
  decrypt(encrypted: string, nonce: string, senderPublicKey: string): string {
    const sharedKey = this.getSharedKey(senderPublicKey);
    
    const decrypted = nacl.box.open.after(
      decodeBase64(encrypted),
      decodeBase64(nonce),
      sharedKey
    );

    if (!decrypted) {
      throw new Error('Decryption failed - message may be tampered or corrupted');
    }

    return encodeUTF8(decrypted);
  }

  /**
   * Encrypt file/binary data
   */
  encryptFile(data: Uint8Array, recipientPublicKey: string): EncryptedMessage {
    const sharedKey = this.getSharedKey(recipientPublicKey);
    const nonce = nacl.randomBytes(nacl.box.nonceLength);

    const encrypted = nacl.box.after(data, nonce, sharedKey);
    
    if (!encrypted) {
      throw new Error('File encryption failed');
    }

    return {
      encrypted: encodeBase64(encrypted),
      nonce: encodeBase64(nonce),
    };
  }

  /**
   * Decrypt file/binary data
   */
  decryptFile(encrypted: string, nonce: string, senderPublicKey: string): Uint8Array {
    const sharedKey = this.getSharedKey(senderPublicKey);
    
    const decrypted = nacl.box.open.after(
      decodeBase64(encrypted),
      decodeBase64(nonce),
      sharedKey
    );

    if (!decrypted) {
      throw new Error('File decryption failed');
    }

    return decrypted;
  }

  /**
   * Generate safety number for verifying E2E encryption
   * Both users should see the same number
   */
  generateSafetyNumber(theirPublicKey: string): string {
    // Combine both public keys in consistent order
    const myKey = this.keyPair.publicKey;
    const theirKey = decodeBase64(theirPublicKey);
    
    // Sort keys for consistent ordering
    const combined = myKey < theirKey 
      ? new Uint8Array([...myKey, ...theirKey])
      : new Uint8Array([...theirKey, ...myKey]);
    
    // Hash and format as 60-digit number
    const hash = nacl.hash(combined);
    let safetyNumber = '';
    for (let i = 0; i < 30; i++) {
      safetyNumber += (hash[i] % 100).toString().padStart(2, '0');
      if ((i + 1) % 5 === 0 && i < 29) safetyNumber += ' ';
    }
    
    return safetyNumber;
  }

  /**
   * Encrypt for multiple recipients (group chat)
   * Returns map of recipientId -> encrypted message
   */
  encryptForGroup(message: string, recipients: { id: string; publicKey: string }[]): Map<string, EncryptedMessage> {
    const result = new Map<string, EncryptedMessage>();
    
    for (const recipient of recipients) {
      result.set(recipient.id, this.encrypt(message, recipient.publicKey));
    }
    
    return result;
  }

  /**
   * Clear all cached keys (call on logout/leave)
   */
  clearKeys(): void {
    this.sharedKeys.clear();
  }
}

// Singleton instance for the session
let cryptoInstance: SecureCrypto | null = null;

export function getCrypto(): SecureCrypto {
  if (!cryptoInstance) {
    cryptoInstance = new SecureCrypto();
  }
  return cryptoInstance;
}

export function resetCrypto(): void {
  if (cryptoInstance) {
    cryptoInstance.clearKeys();
  }
  cryptoInstance = null;
}
