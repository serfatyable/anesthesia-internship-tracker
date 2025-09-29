// lib/security/encryption.ts

import crypto from 'crypto';

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  saltLength: number;
  iterations: number;
}

export const encryptionConfig: EncryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyLength: 32, // 256 bits
  ivLength: 16,  // 128 bits
  saltLength: 32, // 256 bits
  iterations: 100000, // PBKDF2 iterations
};

export class EncryptionService {
  private config: EncryptionConfig;

  constructor(config: EncryptionConfig = encryptionConfig) {
    this.config = config;
  }

  /**
   * Generate a random key
   */
  generateKey(): string {
    return crypto.randomBytes(this.config.keyLength).toString('hex');
  }

  /**
   * Generate a random IV
   */
  generateIV(): string {
    return crypto.randomBytes(this.config.ivLength).toString('hex');
  }

  /**
   * Generate a random salt
   */
  generateSalt(): string {
    return crypto.randomBytes(this.config.saltLength).toString('hex');
  }

  /**
   * Derive key from password using PBKDF2
   */
  deriveKey(password: string, salt: string): Buffer {
    return crypto.pbkdf2Sync(
      password,
      Buffer.from(salt, 'hex'),
      this.config.iterations,
      this.config.keyLength,
      'sha256'
    );
  }

  /**
   * Encrypt data
   */
  encrypt(data: string, key: string, iv?: string): {
    encrypted: string;
    iv: string;
    tag: string;
  } {
    const keyBuffer = Buffer.from(key, 'hex');
    const ivBuffer = iv ? Buffer.from(iv, 'hex') : crypto.randomBytes(this.config.ivLength);
    
    const cipher = crypto.createCipher(this.config.algorithm, keyBuffer);
    cipher.setAAD(Buffer.from('aad')); // Additional authenticated data
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: ivBuffer.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  /**
   * Decrypt data
   */
  decrypt(encrypted: string, key: string, iv: string, tag: string): string {
    const keyBuffer = Buffer.from(key, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');
    const tagBuffer = Buffer.from(tag, 'hex');
    
    const decipher = crypto.createDecipher(this.config.algorithm, keyBuffer);
    decipher.setAAD(Buffer.from('aad')); // Additional authenticated data
    decipher.setAuthTag(tagBuffer);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Hash data using SHA-256
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Hash data using SHA-512
   */
  hash512(data: string): string {
    return crypto.createHash('sha512').update(data).digest('hex');
  }

  /**
   * Create HMAC
   */
  createHMAC(data: string, key: string): string {
    return crypto.createHmac('sha256', key).update(data).digest('hex');
  }

  /**
   * Verify HMAC
   */
  verifyHMAC(data: string, key: string, hmac: string): boolean {
    const expectedHmac = this.createHMAC(data, key);
    return crypto.timingSafeEqual(
      Buffer.from(hmac, 'hex'),
      Buffer.from(expectedHmac, 'hex')
    );
  }

  /**
   * Generate secure random string
   */
  generateRandomString(length: number): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate secure random bytes
   */
  generateRandomBytes(length: number): Buffer {
    return crypto.randomBytes(length);
  }

  /**
   * Generate UUID v4
   */
  generateUUID(): string {
    return crypto.randomUUID();
  }

  /**
   * Generate secure token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64url');
  }

  /**
   * Generate JWT secret
   */
  generateJWTSecret(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Generate API key
   */
  generateAPIKey(): string {
    const prefix = 'ak_';
    const randomPart = crypto.randomBytes(32).toString('base64url');
    return `${prefix}${randomPart}`;
  }

  /**
   * Generate session ID
   */
  generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate password reset token
   */
  generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate email verification token
   */
  generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate two-factor authentication secret
   */
  generate2FASecret(): string {
    return crypto.randomBytes(20).toString('base32');
  }

  /**
   * Generate TOTP code
   */
  generateTOTP(secret: string, timeStep: number = 30): string {
    const key = Buffer.from(secret, 'base32');
    const time = Math.floor(Date.now() / 1000 / timeStep);
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeUInt32BE(0, 0);
    timeBuffer.writeUInt32BE(time, 4);
    
    const hmac = crypto.createHmac('sha1', key).update(timeBuffer).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const code = ((hmac[offset] & 0x7f) << 24) |
                 ((hmac[offset + 1] & 0xff) << 16) |
                 ((hmac[offset + 2] & 0xff) << 8) |
                 (hmac[offset + 3] & 0xff);
    
    return (code % 1000000).toString().padStart(6, '0');
  }

  /**
   * Verify TOTP code
   */
  verifyTOTP(secret: string, code: string, timeStep: number = 30, window: number = 1): boolean {
    const expectedCode = this.generateTOTP(secret, timeStep);
    
    // Check current time step
    if (crypto.timingSafeEqual(Buffer.from(code), Buffer.from(expectedCode))) {
      return true;
    }
    
    // Check previous and next time steps for clock drift
    for (let i = -window; i <= window; i++) {
      if (i === 0) continue;
      
      const time = Math.floor(Date.now() / 1000 / timeStep) + i;
      const timeBuffer = Buffer.alloc(8);
      timeBuffer.writeUInt32BE(0, 0);
      timeBuffer.writeUInt32BE(time, 4);
      
      const key = Buffer.from(secret, 'base32');
      const hmac = crypto.createHmac('sha1', key).update(timeBuffer).digest();
      const offset = hmac[hmac.length - 1] & 0xf;
      const expectedCodeForTime = ((hmac[offset] & 0x7f) << 24) |
                                  ((hmac[offset + 1] & 0xff) << 16) |
                                  ((hmac[offset + 2] & 0xff) << 8) |
                                  (hmac[offset + 3] & 0xff);
      
      const codeForTime = (expectedCodeForTime % 1000000).toString().padStart(6, '0');
      
      if (crypto.timingSafeEqual(Buffer.from(code), Buffer.from(codeForTime))) {
        return true;
      }
    }
    
    return false;
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();

// Export utility functions
export const cryptoUtils = {
  /**
   * Generate secure password
   */
  generateSecurePassword(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    // Ensure at least one character from each category
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 32)];
    
    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  },

  /**
   * Check password strength
   */
  checkPasswordStrength(password: string): {
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;
    
    if (password.length >= 8) score += 1;
    else feedback.push('Use at least 8 characters');
    
    if (password.length >= 12) score += 1;
    else feedback.push('Use at least 12 characters for better security');
    
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Include lowercase letters');
    
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Include uppercase letters');
    
    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Include numbers');
    
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('Include special characters');
    
    if (password.length >= 16) score += 1;
    else feedback.push('Use at least 16 characters for maximum security');
    
    if (!/(.)\1{2,}/.test(password)) score += 1;
    else feedback.push('Avoid repeating characters');
    
    if (!/123|abc|qwe|asd|zxc/i.test(password)) score += 1;
    else feedback.push('Avoid common patterns');
    
    return { score, feedback };
  },

  /**
   * Generate secure random password
   */
  generateRandomPassword(length: number = 16): string {
    return encryptionService.generateRandomString(length);
  },
};
