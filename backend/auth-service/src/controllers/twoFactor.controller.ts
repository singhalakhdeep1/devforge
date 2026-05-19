import { Request, Response } from 'express';
import { TwoFactorService } from '../services/twoFactor.service';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const twoFactorService = new TwoFactorService();

// Validation schemas
const setupSchema = z.object({});

const enableSchema = z.object({
    token: z.string().length(6).regex(/^\d{6}$/)
});

const verifySchema = z.object({
    userId: z.string(),
    token: z.string().min(6).max(10)
});

const disableSchema = z.object({
    password: z.string().min(1),
    token: z.string().length(6).regex(/^\d{6}$/)
});

const regenerateBackupCodesSchema = z.object({
    password: z.string().min(1)
});

export class TwoFactorController {
    /**
     * Setup 2FA - Generate secret & QR code
     * POST /api/auth/2fa/setup
     */
    async setup(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const email = req.user!.email;

            // Check if user already has 2FA enabled
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { twoFactorEnabled: true }
            });

            if (user?.twoFactorEnabled) {
                return res.status(400).json({
                    error: '2FA is already enabled. Disable it first to set up again.'
                });
            }

            // Generate secret
            const { secret, otpauthUrl } = await twoFactorService.generateSecret(email);

            // Generate QR code
            const qrCode = await twoFactorService.generateQRCode(otpauthUrl);

            // Encrypt and save secret to database (not enabled yet)
            const encryptedData = twoFactorService.encryptSecret(secret);

            await prisma.user.update({
                where: { id: userId },
                data: {
                    twoFactorSecret: encryptedData.encrypted,
                    twoFactorIv: encryptedData.iv,
                    twoFactorTag: encryptedData.tag,
                    twoFactorEnabled: false,
                    twoFactorVerified: false
                }
            });

            res.json({
                secret,
                qrCode,
                message: 'Scan QR code with your authenticator app (Google Authenticator, Authy, etc.)'
            });
        } catch (error: any) {
            console.error('2FA setup error:', error);
            res.status(500).json({ error: 'Failed to setup 2FA' });
        }
    }

    /**
     * Verify and enable 2FA
     * POST /api/auth/2fa/enable
     */
    async enable(req: Request, res: Response) {
        try {
            const validation = enableSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    error: 'Invalid token format',
                    details: validation.error.errors
                });
            }

            const userId = req.user!.id;
            const { token } = validation.data;

            // Get user's secret
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    twoFactorSecret: true,
                    twoFactorIv: true,
                    twoFactorTag: true,
                    twoFactorEnabled: true
                }
            });

            if (!user?.twoFactorSecret || !user.twoFactorIv || !user.twoFactorTag) {
                return res.status(400).json({
                    error: 'Please run setup first'
                });
            }

            if (user.twoFactorEnabled) {
                return res.status(400).json({
                    error: '2FA is already enabled'
                });
            }

            // Decrypt secret
            const secret = twoFactorService.decryptSecret(
                user.twoFactorSecret,
                user.twoFactorIv,
                user.twoFactorTag
            );

            // Verify token
            const isValid = twoFactorService.verifyToken(secret, token);

            if (!isValid) {
                return res.status(400).json({
                    error: 'Invalid 2FA token. Please try again.'
                });
            }

            // Generate backup codes
            const backupCodes = twoFactorService.generateBackupCodes(10);
            const hashedCodes = await twoFactorService.hashBackupCodes(backupCodes);

            // Enable 2FA
            await prisma.user.update({
                where: { id: userId },
                data: {
                    twoFactorEnabled: true,
                    twoFactorVerified: true,
                    backupCodes: JSON.stringify(hashedCodes)
                }
            });

            // Log the event
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: '2FA_ENABLED',
                    resourceType: 'USER_SECURITY',
                    resourceId: userId,
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent') || 'unknown'
                }
            });

            res.json({
                message: '2FA enabled successfully',
                backupCodes,
                warning: 'Save these backup codes in a secure location. You will not see them again.'
            });
        } catch (error: any) {
            console.error('2FA enable error:', error);
            res.status(500).json({ error: 'Failed to enable 2FA' });
        }
    }

    /**
     * Verify 2FA during login
     * POST /api/auth/2fa/verify
     */
    async verify(req: Request, res: Response) {
        try {
            const validation = verifySchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    error: 'Invalid request',
                    details: validation.error.errors
                });
            }

            const { userId, token } = validation.data;

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    twoFactorEnabled: true,
                    twoFactorSecret: true,
                    twoFactorIv: true,
                    twoFactorTag: true,
                    backupCodes: true
                }
            });

            if (!user || !user.twoFactorEnabled) {
                return res.status(400).json({
                    error: '2FA is not enabled for this user'
                });
            }

            // Check if it's a TOTP token (6 digits)
            if (twoFactorService.isValidTokenFormat(token)) {
                const secret = twoFactorService.decryptSecret(
                    user.twoFactorSecret!,
                    user.twoFactorIv!,
                    user.twoFactorTag!
                );

                const isValid = twoFactorService.verifyToken(secret, token);

                if (isValid) {
                    return res.json({
                        message: '2FA verified successfully',
                        success: true
                    });
                }
            }

            // Check if it's a backup code
            if (twoFactorService.isValidBackupCodeFormat(token)) {
                const hashedCodes = JSON.parse(user.backupCodes || '[]');
                const result = await twoFactorService.verifyBackupCode(hashedCodes, token);

                if (result.isValid && result.usedIndex !== null) {
                    // Remove used backup code
                    const updatedCodes = twoFactorService.removeBackupCode(hashedCodes, result.usedIndex);

                    await prisma.user.update({
                        where: { id: userId },
                        data: { backupCodes: JSON.stringify(updatedCodes) }
                    });

                    // Log backup code usage
                    await prisma.auditLog.create({
                        data: {
                            userId,
                            action: '2FA_BACKUP_CODE_USED',
                            resourceType: 'USER_SECURITY',
                            resourceId: userId,
                            ipAddress: req.ip,
                            userAgent: req.get('user-agent') || 'unknown'
                        }
                    });

                    return res.json({
                        message: '2FA verified with backup code',
                        success: true,
                        remainingBackupCodes: updatedCodes.length
                    });
                }
            }

            res.status(401).json({
                error: 'Invalid 2FA code or backup code',
                success: false
            });
        } catch (error: any) {
            console.error('2FA verify error:', error);
            res.status(500).json({ error: 'Failed to verify 2FA' });
        }
    }

    /**
     * Disable 2FA
     * POST /api/auth/2fa/disable
     */
    async disable(req: Request, res: Response) {
        try {
            const validation = disableSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    error: 'Invalid request',
                    details: validation.error.errors
                });
            }

            const userId = req.user!.id;
            const { password, token } = validation.data;

            // Verify password
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    password: true,
                    twoFactorEnabled: true,
                    twoFactorSecret: true,
                    twoFactorIv: true,
                    twoFactorTag: true
                }
            });

            if (!user || !user.twoFactorEnabled) {
                return res.status(400).json({
                    error: '2FA is not enabled'
                });
            }

            const bcrypt = require('bcrypt');
            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                return res.status(401).json({
                    error: 'Invalid password'
                });
            }

            // Verify 2FA token
            const secret = twoFactorService.decryptSecret(
                user.twoFactorSecret!,
                user.twoFactorIv!,
                user.twoFactorTag!
            );
            const isValid = twoFactorService.verifyToken(secret, token);

            if (!isValid) {
                return res.status(401).json({
                    error: 'Invalid 2FA token'
                });
            }

            // Disable 2FA
            await prisma.user.update({
                where: { id: userId },
                data: {
                    twoFactorEnabled: false,
                    twoFactorSecret: null,
                    twoFactorIv: null,
                    twoFactorTag: null,
                    backupCodes: null,
                    twoFactorVerified: false
                }
            });

            // Log the event
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: '2FA_DISABLED',
                    resourceType: 'USER_SECURITY',
                    resourceId: userId,
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent') || 'unknown'
                }
            });

            res.json({
                message: '2FA disabled successfully'
            });
        } catch (error: any) {
            console.error('2FA disable error:', error);
            res.status(500).json({ error: 'Failed to disable 2FA' });
        }
    }

    /**
     * Regenerate backup codes
     * POST /api/auth/2fa/backup-codes
     */
    async regenerateBackupCodes(req: Request, res: Response) {
        try {
            const validation = regenerateBackupCodesSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    error: 'Invalid request',
                    details: validation.error.errors
                });
            }

            const userId = req.user!.id;
            const { password } = validation.data;

            // Verify password
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    password: true,
                    twoFactorEnabled: true
                }
            });

            if (!user || !user.twoFactorEnabled) {
                return res.status(400).json({
                    error: '2FA is not enabled'
                });
            }

            const bcrypt = require('bcrypt');
            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                return res.status(401).json({
                    error: 'Invalid password'
                });
            }

            // Generate new backup codes
            const backupCodes = twoFactorService.generateBackupCodes(10);
            const hashedCodes = await twoFactorService.hashBackupCodes(backupCodes);

            // Update in database
            await prisma.user.update({
                where: { id: userId },
                data: { backupCodes: JSON.stringify(hashedCodes) }
            });

            // Log the event
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: '2FA_BACKUP_CODES_REGENERATED',
                    resourceType: 'USER_SECURITY',
                    resourceId: userId,
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent') || 'unknown'
                }
            });

            res.json({
                backupCodes,
                message: 'New backup codes generated. Save them securely.'
            });
        } catch (error: any) {
            console.error('Regenerate backup codes error:', error);
            res.status(500).json({ error: 'Failed to regenerate backup codes' });
        }
    }

    /**
     * Get 2FA status
     * GET /api/auth/2fa/status
     */
    async getStatus(req: Request, res: Response) {
        try {
            const userId = req.user!.id;

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    twoFactorEnabled: true,
                    twoFactorVerified: true,
                    backupCodes: true
                }
            });

            const backupCodesCount = user?.backupCodes
                ? JSON.parse(user.backupCodes).length
                : 0;

            res.json({
                enabled: user?.twoFactorEnabled || false,
                verified: user?.twoFactorVerified || false,
                backupCodesRemaining: backupCodesCount
            });
        } catch (error: any) {
            console.error('Get 2FA status error:', error);
            res.status(500).json({ error: 'Failed to get 2FA status' });
        }
    }
}

export default new TwoFactorController();
