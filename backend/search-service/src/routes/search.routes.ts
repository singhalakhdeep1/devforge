import { Router } from 'express';
import { SearchService } from '../services/search.service';
import { logger } from '../config/logger';

const router = Router();
const searchService = new SearchService();

/**
 * Universal search across all resources
 * GET /api/search?q=query&page=1&limit=20
 */
router.get('/', async (req, res) => {
    try {
        const {
            q = '',
            page = '1',
            limit = '20',
            tags,
            language,
            visibility,
            status,
            dateFrom,
            dateTo,
            sortField = '_score',
            sortOrder = 'desc',
            fuzzy = 'true',
            highlight = 'true'
        } = req.query;

        const results = await searchService.universalSearch({
            query: q as string,
            filters: {
                tags: tags ? (tags as string).split(',') : undefined,
                language: language ? (language as string).split(',') : undefined,
                visibility: visibility ? (visibility as string).split(',') : undefined,
                status: status ? (status as string).split(',') : undefined,
                dateFrom: dateFrom as string,
                dateTo: dateTo as string
            },
            sort: {
                field: sortField as string,
                order: sortOrder as 'asc' | 'desc'
            },
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            fuzzy: fuzzy === 'true',
            highlight: highlight === 'true'
        });

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        logger.error('Search error:', error);
        res.status(500).json({
            success: false,
            error: 'Search failed'
        });
    }
});

/**
 * Search users
 * GET /api/search/users?q=john
 */
router.get('/users', async (req, res) => {
    try {
        const {
            q = '',
            page = '1',
            limit = '20',
            skills,
            sortField = '_score',
            sortOrder = 'desc',
            fuzzy = 'true'
        } = req.query;

        const results = await searchService.searchUsers({
            query: q as string,
            filters: {
                tags: skills ? (skills as string).split(',') : undefined
            },
            sort: {
                field: sortField as string,
                order: sortOrder as 'asc' | 'desc'
            },
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            fuzzy: fuzzy === 'true'
        });

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        logger.error('User search error:', error);
        res.status(500).json({
            success: false,
            error: 'User search failed'
        });
    }
});

/**
 * Search projects
 * GET /api/search/projects?q=react
 */
router.get('/projects', async (req, res) => {
    try {
        const {
            q = '',
            page = '1',
            limit = '20',
            tags,
            language,
            visibility,
            status,
            sortField = '_score',
            sortOrder = 'desc',
            fuzzy = 'true'
        } = req.query;

        const results = await searchService.searchProjects({
            query: q as string,
            filters: {
                tags: tags ? (tags as string).split(',') : undefined,
                language: language ? (language as string).split(',') : undefined,
                visibility: visibility ? (visibility as string).split(',') : undefined,
                status: status ? (status as string).split(',') : undefined
            },
            sort: {
                field: sortField as string,
                order: sortOrder as 'asc' | 'desc'
            },
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            fuzzy: fuzzy === 'true'
        });

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        logger.error('Project search error:', error);
        res.status(500).json({
            success: false,
            error: 'Project search failed'
        });
    }
});

/**
 * Autocomplete
 * GET /api/search/autocomplete?q=joh&type=users
 */
router.get('/autocomplete', async (req, res) => {
    try {
        const { q = '', type = 'projects', limit = '10' } = req.query;

        if (!['users', 'projects', 'teams'].includes(type as string)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid type. Must be users, projects, or teams'
            });
        }

        const results = await searchService.autocomplete({
            query: q as string,
            type: type as 'users' | 'projects' | 'teams',
            limit: parseInt(limit as string)
        });

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        logger.error('Autocomplete error:', error);
        res.status(500).json({
            success: false,
            error: 'Autocomplete failed'
        });
    }
});

/**
 * NLP-powered search
 * GET /api/search/nlp?q=best javascript projects for beginners
 */
router.get('/nlp', async (req, res) => {
    try {
        const { q = '', page = '1', limit = '20' } = req.query;

        const results = await searchService.nlpSearch(
            q as string,
            parseInt(page as string),
            parseInt(limit as string)
        );

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        logger.error('NLP search error:', error);
        res.status(500).json({
            success: false,
            error: 'NLP search failed'
        });
    }
});

/**
 * Find similar items
 * GET /api/search/similar/:index/:id
 */
router.get('/similar/:index/:id', async (req, res) => {
    try {
        const { index, id } = req.params;
        const { limit = '10' } = req.query;

        const results = await searchService.findSimilar(
            index,
            id,
            parseInt(limit as string)
        );

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        logger.error('Find similar error:', error);
        res.status(500).json({
            success: false,
            error: 'Find similar failed'
        });
    }
});

/**
 * Get search suggestions
 * GET /api/search/suggestions?q=rea
 */
router.get('/suggestions', async (req, res) => {
    try {
        const { q = '', limit = '5' } = req.query;

        const results = await searchService.getSearchSuggestions(
            q as string,
            parseInt(limit as string)
        );

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        logger.error('Get suggestions error:', error);
        res.status(500).json({
            success: false,
            error: 'Get suggestions failed'
        });
    }
});

/**
 * Index a document (admin only)
 * POST /api/search/index/:index/:id
 */
router.post('/index/:index/:id', async (req, res) => {
    try {
        const { index, id } = req.params;
        const document = req.body;

        await searchService.indexDocument(index, id, document);

        res.json({
            success: true,
            message: 'Document indexed successfully'
        });
    } catch (error) {
        logger.error('Index document error:', error);
        res.status(500).json({
            success: false,
            error: 'Index document failed'
        });
    }
});

/**
 * Bulk index documents (admin only)
 * POST /api/search/bulk/:index
 */
router.post('/bulk/:index', async (req, res) => {
    try {
        const { index } = req.params;
        const { documents } = req.body;

        if (!Array.isArray(documents)) {
            return res.status(400).json({
                success: false,
                error: 'documents must be an array'
            });
        }

        await searchService.bulkIndex(index, documents);

        res.json({
            success: true,
            message: `Bulk indexed ${documents.length} documents`
        });
    } catch (error) {
        logger.error('Bulk index error:', error);
        res.status(500).json({
            success: false,
            error: 'Bulk index failed'
        });
    }
});

/**
 * Update a document (admin only)
 * PATCH /api/search/index/:index/:id
 */
router.patch('/index/:index/:id', async (req, res) => {
    try {
        const { index, id } = req.params;
        const document = req.body;

        await searchService.updateDocument(index, id, document);

        res.json({
            success: true,
            message: 'Document updated successfully'
        });
    } catch (error) {
        logger.error('Update document error:', error);
        res.status(500).json({
            success: false,
            error: 'Update document failed'
        });
    }
});

/**
 * Delete a document (admin only)
 * DELETE /api/search/index/:index/:id
 */
router.delete('/index/:index/:id', async (req, res) => {
    try {
        const { index, id } = req.params;

        await searchService.deleteDocument(index, id);

        res.json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        logger.error('Delete document error:', error);
        res.status(500).json({
            success: false,
            error: 'Delete document failed'
        });
    }
});

export default router;
