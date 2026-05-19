import { Router } from 'express';
import { EditorService } from '../services/editor.service';
import { logger } from '../config/logger';

export function createEditorRoutes(editorService: EditorService) {
    const router = Router();

    /**
     * Get document metadata
     */
    router.get('/documents/:documentId', (req, res) => {
        try {
            const { documentId } = req.params;
            const metadata = editorService.getDocumentMetadata(documentId);

            if (!metadata) {
                return res.status(404).json({
                    success: false,
                    error: 'Document not found',
                });
            }

            res.json({
                success: true,
                data: metadata,
            });
        } catch (error) {
            logger.error('Get document error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get document',
            });
        }
    });

    /**
     * Update document metadata
     */
    router.patch('/documents/:documentId', (req, res) => {
        try {
            const { documentId } = req.params;
            const metadata = editorService.setDocumentMetadata(documentId, req.body);

            res.json({
                success: true,
                data: metadata,
            });
        } catch (error) {
            logger.error('Update document error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update document',
            });
        }
    });

    /**
     * Get document text
     */
    router.get('/documents/:documentId/text', (req, res) => {
        try {
            const { documentId } = req.params;
            const text = editorService.getDocumentText(documentId);

            res.json({
                success: true,
                data: { text },
            });
        } catch (error) {
            logger.error('Get document text error:', error);
            res.status(404).json({
                success: false,
                error: 'Document not found',
            });
        }
    });

    /**
     * Get document statistics
     */
    router.get('/documents/:documentId/stats', (req, res) => {
        try {
            const { documentId } = req.params;
            const stats = editorService.getDocumentStats(documentId);

            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            logger.error('Get document stats error:', error);
            res.status(404).json({
                success: false,
                error: 'Document not found',
            });
        }
    });

    /**
     * Get active users in document
     */
    router.get('/documents/:documentId/users', (req, res) => {
        try {
            const { documentId } = req.params;
            const users = editorService.getDocumentUsers(documentId);

            res.json({
                success: true,
                data: { users },
            });
        } catch (error) {
            logger.error('Get document users error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get users',
            });
        }
    });

    /**
     * Create document snapshot
     */
    router.post('/documents/:documentId/snapshots', async (req, res) => {
        try {
            const { documentId } = req.params;
            const snapshot = await editorService.createSnapshot(documentId);

            res.json({
                success: true,
                data: snapshot,
            });
        } catch (error) {
            logger.error('Create snapshot error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create snapshot',
            });
        }
    });

    /**
     * Restore document from snapshot
     */
    router.post('/documents/:documentId/restore', async (req, res) => {
        try {
            const { documentId } = req.params;
            const { snapshot } = req.body;

            if (!snapshot) {
                return res.status(400).json({
                    success: false,
                    error: 'Snapshot data required',
                });
            }

            await editorService.restoreSnapshot(documentId, new Uint8Array(snapshot));

            res.json({
                success: true,
                message: 'Document restored successfully',
            });
        } catch (error) {
            logger.error('Restore snapshot error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to restore snapshot',
            });
        }
    });

    /**
     * Export document as JSON
     */
    router.get('/documents/:documentId/export/json', (req, res) => {
        try {
            const { documentId } = req.params;
            const data = editorService.exportAsJSON(documentId);

            res.json({
                success: true,
                data,
            });
        } catch (error) {
            logger.error('Export JSON error:', error);
            res.status(404).json({
                success: false,
                error: 'Document not found',
            });
        }
    });

    /**
     * Export document as Markdown
     */
    router.get('/documents/:documentId/export/markdown', (req, res) => {
        try {
            const { documentId } = req.params;
            const markdown = editorService.exportAsMarkdown(documentId);

            res.setHeader('Content-Type', 'text/markdown');
            res.setHeader('Content-Disposition', `attachment; filename="${documentId}.md"`);
            res.send(markdown);
        } catch (error) {
            logger.error('Export Markdown error:', error);
            res.status(404).json({
                success: false,
                error: 'Document not found',
            });
        }
    });

    /**
     * Get document history
     */
    router.get('/documents/:documentId/history', (req, res) => {
        try {
            const { documentId } = req.params;
            const history = editorService.getDocumentHistory(documentId);

            res.json({
                success: true,
                data: { history },
            });
        } catch (error) {
            logger.error('Get history error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get history',
            });
        }
    });

    /**
     * Get all active documents
     */
    router.get('/documents', (req, res) => {
        try {
            const documents = editorService.getAllDocuments();

            res.json({
                success: true,
                data: { documents },
            });
        } catch (error) {
            logger.error('Get all documents error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get documents',
            });
        }
    });

    return router;
}
