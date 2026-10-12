import cron from 'node-cron';
import prisma from '../lib/prisma';
import { createWriteStream } from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import archiver from 'archiver';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
});

class BackupService {
    private backupDir = path.join(__dirname, '../../backups');

    constructor() {
        // Schedule daily backups at 2 AM
        cron.schedule('0 2 * * *', () => {
            this.performFullBackup();
        });

        // Schedule weekly database backups on Sundays at 3 AM
        cron.schedule('0 3 * * 0', () => {
            this.performDatabaseBackup();
        });

        // Clean up old backups monthly
        cron.schedule('0 4 1 * *', () => {
            this.cleanupOldBackups(90); // Keep 90 days
        });
    }

    async performFullBackup() {
        console.log('Starting full backup...');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `full-backup-${timestamp}`;
        const backupPath = path.join(this.backupDir, `${backupName}.zip`);

        try {
            // Create archive
            const output = createWriteStream(backupPath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            archive.pipe(output);

            // Add database backup
            await this.performDatabaseBackup(backupName);
            archive.file(path.join(this.backupDir, `${backupName}-db.sql`), {
                name: 'database.sql'
            });

            // Add uploaded files
            archive.directory(path.join(__dirname, '../../uploads'), 'uploads');

            // Add configuration files
            archive.file('.env', { name: 'config/env' });
            archive.file('docker-compose.yml', { name: 'config/docker-compose.yml' });

            // Finalize archive
            await archive.finalize();

            // Upload to S3
            await this.uploadToS3(backupPath, `backups/${backupName}.zip`);

            console.log('Full backup completed successfully');

            // Log backup
            await this.logBackup({
                type: 'FULL',
                name: backupName,
                size: archive.pointer(),
                status: 'SUCCESS'
            });
        } catch (error) {
            console.error('Full backup failed:', error);
            await this.logBackup({
                type: 'FULL',
                name: backupName,
                size: 0,
                status: 'FAILURE',
                error: (error as Error).message
            });
        }
    }

    async performDatabaseBackup(backupName?: string) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const name = backupName || `db-backup-${timestamp}`;
        const backupPath = path.join(this.backupDir, `${name}-db.sql`);

        try {
            // PostgreSQL backup
            const pgBackupCommand = `pg_dump ${process.env.DATABASE_URL} > ${backupPath}`;
            await execAsync(pgBackupCommand);

            // MongoDB backup
            const mongoBackupPath = path.join(this.backupDir, `${name}-mongo`);
            const mongoBackupCommand = `mongodump --uri="${process.env.MONGODB_URI}" --out="${mongoBackupPath}"`;
            await execAsync(mongoBackupCommand);

            // Upload to S3
            await this.uploadToS3(backupPath, `backups/database/${name}.sql`);

            console.log('Database backup completed successfully');

            await this.logBackup({
                type: 'DATABASE',
                name,
                size: 0, // Calculate size from file
                status: 'SUCCESS'
            });
        } catch (error) {
            console.error('Database backup failed:', error);
            await this.logBackup({
                type: 'DATABASE',
                name,
                size: 0,
                status: 'FAILURE',
                error: (error as Error).message
            });
        }
    }

    async uploadToS3(filePath: string, key: string) {
        const fileStream = createReadStream(filePath);

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: key,
            Body: fileStream,
            ServerSideEncryption: 'AES256'
        });

        await s3Client.send(command);
    }

    async restoreFromBackup(backupName: string) {
        console.log(`Restoring from backup: ${backupName}`);

        try {
            // Download from S3
            const backupPath = path.join(this.backupDir, `${backupName}.zip`);
            // Download logic here

            // Extract archive
            // Extraction logic here

            // Restore database
            const dbBackupPath = path.join(this.backupDir, 'database.sql');
            const restoreCommand = `psql ${process.env.DATABASE_URL} < ${dbBackupPath}`;
            await execAsync(restoreCommand);

            console.log('Restore completed successfully');

            await this.logBackup({
                type: 'RESTORE',
                name: backupName,
                size: 0,
                status: 'SUCCESS'
            });
        } catch (error) {
            console.error('Restore failed:', error);
            await this.logBackup({
                type: 'RESTORE',
                name: backupName,
                size: 0,
                status: 'FAILURE',
                error: (error as Error).message
            });
            throw error;
        }
    }

    async cleanupOldBackups(daysToKeep: number) {
        console.log(`Cleaning up backups older than ${daysToKeep} days`);

        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            const oldBackups = await prisma.backup.findMany({
                where: {
                    createdAt: {
                        lt: cutoffDate
                    }
                }
            });

            for (const backup of oldBackups) {
                // Delete from S3
                // Deletion logic here

                // Delete from database
                await prisma.backup.delete({
                    where: { id: backup.id }
                });
            }

            console.log(`Cleaned up ${oldBackups.length} old backups`);
        } catch (error) {
            console.error('Cleanup failed:', error);
        }
    }

    async getBackupList() {
        return await prisma.backup.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100
        });
    }

    async getBackupStats() {
        const [total, successful, failed, lastBackup] = await Promise.all([
            prisma.backup.count(),
            prisma.backup.count({ where: { status: 'SUCCESS' } }),
            prisma.backup.count({ where: { status: 'FAILURE' } }),
            prisma.backup.findFirst({
                where: { status: 'SUCCESS' },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        return {
            total,
            successful,
            failed,
            successRate: total > 0 ? (successful / total) * 100 : 0,
            lastBackup: lastBackup?.createdAt,
            lastBackupName: lastBackup?.name
        };
    }

    private async logBackup(data: {
        type: string;
        name: string;
        size: number;
        status: string;
        error?: string;
    }) {
        await prisma.backup.create({
            data: {
                type: data.type,
                name: data.name,
                size: data.size,
                status: data.status,
                error: data.error,
                createdAt: new Date()
            }
        });
    }
}

export const backupService = new BackupService();

// Helper function import
import { createReadStream } from 'fs';
