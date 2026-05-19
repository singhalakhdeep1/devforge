import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

export class TwoFactorService {
    /**
     * Generate a new 2FA secret for a user
     */
    async generateSecret(email: string) {
        const secret = speakeasy.generateSecret({
            name: `DevHub (${email})`,
            issuer: 'DevHub',
            length: 32
        });

        return {
            secret: secret.base32,
            otpauthUrl: secret.otpauth_url!
        };
    }

    /**
     * Generate QR code image as data URL
     */
    async generateQRCode(otpauthUrl: string): Promise<string> {
        try {
            return await QRCode.toDataURL(otpauthUrl);
        } catch (error) {
            throw new Error('Failed to generate QR code');
        }
    }

    /**
     * Verify TOTP token
     */
    verifyToken(secret: string, token: string): boolean {
        return speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window: 2  // Allow 2 time steps before/after (±60 seconds)
        });
    }

    /**
     * Generate backup codes for account recovery
     */
    generateBackupCodes(count: number = 10): string[] {
        const codes: string[] = [];
        for (let i = 0; i < count; i++) {
            // Generate 8-character alphanumeric code
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            const formatted = `${code.slice(0, 4)}-${code.slice(4, 8)}`;
            codes.push(formatted);
        }
        return codes;
    }

    /**
     * Hash backup codes for secure storage
     */
    async hashBackupCodes(codes: string[]): Promise<string[]> {
        const saltRounds = 10;
        return Promise.all(
            codes.map(code => bcrypt.hash(code, saltRounds))
        );
    }

    /**
     * Verify a backup code against stored hashed codes
     */
    async verifyBackupCode(
        hashedCodes: string[],
        providedCode: string
    ): Promise<{ isValid: boolean; usedIndex: number | null }> {
        for (let i = 0; i < hashedCodes.length; i++) {
            const isMatch = await bcrypt.compare(providedCode, hashedCodes[i]);
            if (isMatch) {
                return { isValid: true, usedIndex: i };
            }
        }
        return { isValid: false, usedIndex: null };
    }

    /**
     * Remove a used backup code from the list
     */
    removeBackupCode(hashedCodes: string[], index: number): string[] {
        return hashedCodes.filter((_, i) => i !== index);
    }

    /**
     * Encrypt secret for storage (using AES-256-GCM)
     */
    encryptSecret(secret: string): { encrypted: string; iv: string; tag: string } {
        const algorithm = 'aes-256-gcm';
        const key = Buffer.from(process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'), 'hex');
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv(algorithm, key, iv);

        let encrypted = cipher.update(secret, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const tag = cipher.getAuthTag();

        return {
            encrypted,
            iv: iv.toString('hex'),
            tag: tag.toString('hex')
        };
    }

    /**
     * Decrypt secret from storage
     */
    decryptSecret(encrypted: string, iv: string, tag: string): string {
        const algorithm = 'aes-256-gcm';
        const key = Buffer.from(process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'), 'hex');

        const decipher = crypto.createDecipheriv(
            algorithm,
            key,
            Buffer.from(iv, 'hex')
        );

        decipher.setAuthTag(Buffer.from(tag, 'hex'));

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    /**
     * Generate recovery email token
     */
    generateRecoveryToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Validate token format (6 digits)
     */
    isValidTokenFormat(token: string): boolean {
        return /^\d{6}$/.test(token);
    }

    /**
     * Validate backup code format (XXXX-XXXX)
     */
    isValidBackupCodeFormat(code: string): boolean {
        return /^[A-F0-9]{4}-[A-F0-9]{4}$/.test(code);
    }
}

export default new TwoFactorService();
