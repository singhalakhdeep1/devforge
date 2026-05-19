import { Router, Request, Response, NextFunction } from 'express';
import { S3Service } from '../services/s3.service';
import { upload } from '../config/multer';

const router = Router();
const s3Service = new S3Service();

// POST /api/v1/files/upload - Upload single file
router.post('/upload', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file provided',
            });
        }

        const userId = req.headers['x-user-id'] as string;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User ID required',
            });
        }

        const { folder = 'uploads', isPublic = false } = req.body;

        const fileMetadata = await s3Service.upload({
            buffer: req.file.buffer,
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            userId,
            folder,
            isPublic: isPublic === 'true',
        });

        res.status(201).json({
            success: true,
            data: fileMetadata,
            message: 'File uploaded successfully',
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/v1/files/upload-multiple - Upload multiple files
router.post('/upload-multiple', upload.array('files', 10), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files provided',
            });
        }

        const userId = req.headers['x-user-id'] as string;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User ID required',
            });
        }

        const { folder = 'uploads', isPublic = false } = req.body;

        const uploadPromises = files.map(file =>
            s3Service.upload({
                buffer: file.buffer,
                filename: file.originalname,
                mimetype: file.mimetype,
                userId,
                folder,
                isPublic: isPublic === 'true',
            })
        );

        const filesMetadata = await Promise.all(uploadPromises);

        res.status(201).json({
            success: true,
            data: filesMetadata,
            message: `${filesMetadata.length} files uploaded successfully`,
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/v1/files/:key - Get file URL
router.get('/:key(*)', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const key = req.params.key;
        const url = await s3Service.getSignedUrl(key);

        res.json({
            success: true,
            data: { url },
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/v1/files/:key - Delete file
router.delete('/:key(*)', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const key = req.params.key;
        await s3Service.delete(key);

        res.json({
            success: true,
            message: 'File deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/v1/files/:key/metadata - Get file metadata
router.get('/:key(*)/metadata', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const key = req.params.key;
        const metadata = await s3Service.getMetadata(key);

        res.json({
            success: true,
            data: metadata,
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/v1/files/:key/thumbnail - Generate thumbnail
router.post('/:key(*)/thumbnail', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const key = req.params.key;
        const { width = 200, height = 200 } = req.body;

        const thumbnailUrl = await s3Service.generateThumbnail(key, width, height);

        res.json({
            success: true,
            data: { thumbnailUrl },
            message: 'Thumbnail generated successfully',
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/v1/files/list/:prefix - List files in folder
router.get('/list/:prefix(*)', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const prefix = req.params.prefix;
        const maxKeys = parseInt(req.query.maxKeys as string) || 100;

        const result = await s3Service.listFiles(prefix, maxKeys);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
