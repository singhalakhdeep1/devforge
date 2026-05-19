import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
    ListObjectsV2Command,
    CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { logger } from '../config/logger';

export interface UploadOptions {
    buffer: Buffer;
    filename: string;
    mimetype: string;
    userId: string;
    folder?: string;
    isPublic?: boolean;
}

export interface FileMetadata {
    id: string;
    url: string;
    key: string;
    filename: string;
    mimetype: string;
    size: number;
    bucket: string;
    userId: string;
    createdAt: Date;
}

export class S3Service {
    private s3Client: S3Client;
    private bucket: string;

    constructor() {
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            },
        });
        this.bucket = process.env.AWS_S3_BUCKET || 'devhub-uploads';
    }

    /**
     * Upload file to S3
     */
    async upload(options: UploadOptions): Promise<FileMetadata> {
        try {
            const { buffer, filename, mimetype, userId, folder = 'uploads', isPublic = false } = options;

            const fileId = uuidv4();
            const extension = filename.split('.').pop();
            const key = `${folder}/${userId}/${fileId}.${extension}`;

            // Process image if it's an image file
            let processedBuffer = buffer;
            if (mimetype.startsWith('image/')) {
                processedBuffer = await this.processImage(buffer, mimetype);
            }

            const command = new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: processedBuffer,
                ContentType: mimetype,
                ACL: isPublic ? 'public-read' : 'private',
                Metadata: {
                    userId,
                    originalFilename: filename,
                    uploadedAt: new Date().toISOString(),
                },
            });

            await this.s3Client.send(command);

            const url = isPublic
                ? `https://${this.bucket}.s3.amazonaws.com/${key}`
                : await this.getSignedUrl(key);

            logger.info(`File uploaded successfully: ${key}`);

            return {
                id: fileId,
                url,
                key,
                filename,
                mimetype,
                size: processedBuffer.length,
                bucket: this.bucket,
                userId,
                createdAt: new Date(),
            };
        } catch (error) {
            logger.error('Error uploading file to S3:', error);
            throw new Error('Failed to upload file');
        }
    }

    /**
     * Process and optimize images
     */
    private async processImage(buffer: Buffer, mimetype: string): Promise<Buffer> {
        try {
            const sharpInstance = sharp(buffer);
            const metadata = await sharpInstance.metadata();

            // Resize if image is too large
            if (metadata.width && metadata.width > 2000) {
                sharpInstance.resize(2000, null, {
                    withoutEnlargement: true,
                    fit: 'inside',
                });
            }

            // Convert to WebP for better compression (except for GIFs)
            if (mimetype !== 'image/gif') {
                return await sharpInstance.webp({ quality: 85 }).toBuffer();
            }

            return await sharpInstance.toBuffer();
        } catch (error) {
            logger.error('Error processing image:', error);
            return buffer; // Return original if processing fails
        }
    }

    /**
     * Generate presigned URL for private files
     */
    async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });

            return await getSignedUrl(this.s3Client, command, { expiresIn });
        } catch (error) {
            logger.error('Error generating signed URL:', error);
            throw new Error('Failed to generate signed URL');
        }
    }

    /**
     * Download file from S3
     */
    async download(key: string): Promise<Buffer> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });

            const response = await this.s3Client.send(command);
            const stream = response.Body as any;

            return new Promise((resolve, reject) => {
                const chunks: Buffer[] = [];
                stream.on('data', (chunk: Buffer) => chunks.push(chunk));
                stream.on('end', () => resolve(Buffer.concat(chunks)));
                stream.on('error', reject);
            });
        } catch (error) {
            logger.error('Error downloading file from S3:', error);
            throw new Error('Failed to download file');
        }
    }

    /**
     * Delete file from S3
     */
    async delete(key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });

            await this.s3Client.send(command);
            logger.info(`File deleted successfully: ${key}`);
        } catch (error) {
            logger.error('Error deleting file from S3:', error);
            throw new Error('Failed to delete file');
        }
    }

    /**
     * Get file metadata
     */
    async getMetadata(key: string) {
        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });

            const response = await this.s3Client.send(command);

            return {
                size: response.ContentLength,
                mimetype: response.ContentType,
                lastModified: response.LastModified,
                metadata: response.Metadata,
            };
        } catch (error) {
            logger.error('Error getting file metadata:', error);
            throw new Error('Failed to get file metadata');
        }
    }

    /**
     * List files in a folder
     */
    async listFiles(prefix: string, maxKeys: number = 100) {
        try {
            const command = new ListObjectsV2Command({
                Bucket: this.bucket,
                Prefix: prefix,
                MaxKeys: maxKeys,
            });

            const response = await this.s3Client.send(command);

            return {
                files: response.Contents || [],
                count: response.KeyCount || 0,
                isTruncated: response.IsTruncated || false,
            };
        } catch (error) {
            logger.error('Error listing files:', error);
            throw new Error('Failed to list files');
        }
    }

    /**
     * Copy file within S3
     */
    async copy(sourceKey: string, destinationKey: string): Promise<void> {
        try {
            const command = new CopyObjectCommand({
                Bucket: this.bucket,
                CopySource: `${this.bucket}/${sourceKey}`,
                Key: destinationKey,
            });

            await this.s3Client.send(command);
            logger.info(`File copied: ${sourceKey} -> ${destinationKey}`);
        } catch (error) {
            logger.error('Error copying file:', error);
            throw new Error('Failed to copy file');
        }
    }

    /**
     * Generate thumbnail for image
     */
    async generateThumbnail(key: string, width: number = 200, height: number = 200): Promise<string> {
        try {
            const buffer = await this.download(key);

            const thumbnailBuffer = await sharp(buffer)
                .resize(width, height, {
                    fit: 'cover',
                    position: 'center',
                })
                .webp({ quality: 80 })
                .toBuffer();

            const thumbnailKey = key.replace(/\.[^.]+$/, '_thumb.webp');

            const command = new PutObjectCommand({
                Bucket: this.bucket,
                Key: thumbnailKey,
                Body: thumbnailBuffer,
                ContentType: 'image/webp',
                ACL: 'public-read',
            });

            await this.s3Client.send(command);

            return `https://${this.bucket}.s3.amazonaws.com/${thumbnailKey}`;
        } catch (error) {
            logger.error('Error generating thumbnail:', error);
            throw new Error('Failed to generate thumbnail');
        }
    }
}
