import { Client } from '@elastic/elasticsearch';
import { logger } from './logger';

export const esClient = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    auth: {
        username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
        password: process.env.ELASTICSEARCH_PASSWORD || 'changeme',
    },
    maxRetries: 5,
    requestTimeout: 60000,
});

// Index configurations
export const INDICES = {
    USERS: 'devhub_users',
    PROJECTS: 'devhub_projects',
    COMMENTS: 'devhub_comments',
    FILES: 'devhub_files',
    TEAMS: 'devhub_teams',
};

// User index mapping
export const USER_INDEX_MAPPING = {
    properties: {
        userId: { type: 'keyword' },
        username: {
            type: 'text',
            fields: {
                keyword: { type: 'keyword' },
                completion: { type: 'completion' }
            }
        },
        email: {
            type: 'text',
            fields: { keyword: { type: 'keyword' } }
        },
        firstName: {
            type: 'text',
            analyzer: 'standard',
            fields: { keyword: { type: 'keyword' } }
        },
        lastName: {
            type: 'text',
            analyzer: 'standard',
            fields: { keyword: { type: 'keyword' } }
        },
        fullName: {
            type: 'text',
            analyzer: 'standard'
        },
        bio: {
            type: 'text',
            analyzer: 'english'
        },
        skills: {
            type: 'keyword'
        },
        location: { type: 'text' },
        role: { type: 'keyword' },
        isVerified: { type: 'boolean' },
        isActive: { type: 'boolean' },
        followerCount: { type: 'integer' },
        projectCount: { type: 'integer' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
    }
};

// Project index mapping
export const PROJECT_INDEX_MAPPING = {
    properties: {
        projectId: { type: 'keyword' },
        name: {
            type: 'text',
            analyzer: 'standard',
            fields: {
                keyword: { type: 'keyword' },
                completion: { type: 'completion' }
            }
        },
        slug: { type: 'keyword' },
        description: {
            type: 'text',
            analyzer: 'english'
        },
        readme: {
            type: 'text',
            analyzer: 'english'
        },
        tags: {
            type: 'keyword'
        },
        technologies: {
            type: 'keyword'
        },
        language: { type: 'keyword' },
        visibility: { type: 'keyword' },
        status: { type: 'keyword' },
        stars: { type: 'integer' },
        forks: { type: 'integer' },
        views: { type: 'integer' },
        ownerUsername: { type: 'keyword' },
        memberCount: { type: 'integer' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
        lastActivityAt: { type: 'date' },
    }
};

// Comment index mapping
export const COMMENT_INDEX_MAPPING = {
    properties: {
        commentId: { type: 'keyword' },
        content: {
            type: 'text',
            analyzer: 'english'
        },
        projectId: { type: 'keyword' },
        userId: { type: 'keyword' },
        username: { type: 'keyword' },
        parentId: { type: 'keyword' },
        mentions: { type: 'keyword' },
        isEdited: { type: 'boolean' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
    }
};

// Team index mapping
export const TEAM_INDEX_MAPPING = {
    properties: {
        teamId: { type: 'keyword' },
        name: {
            type: 'text',
            analyzer: 'standard',
            fields: {
                keyword: { type: 'keyword' },
                completion: { type: 'completion' }
            }
        },
        slug: { type: 'keyword' },
        description: {
            type: 'text',
            analyzer: 'english'
        },
        isPublic: { type: 'boolean' },
        memberCount: { type: 'integer' },
        projectCount: { type: 'integer' },
        ownerUsername: { type: 'keyword' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
    }
};

// File index mapping
export const FILE_INDEX_MAPPING = {
    properties: {
        fileId: { type: 'keyword' },
        filename: {
            type: 'text',
            fields: { keyword: { type: 'keyword' } }
        },
        originalName: { type: 'text' },
        mimeType: { type: 'keyword' },
        extension: { type: 'keyword' },
        size: { type: 'long' },
        path: { type: 'keyword' },
        projectId: { type: 'keyword' },
        userId: { type: 'keyword' },
        username: { type: 'keyword' },
        tags: { type: 'keyword' },
        content: {
            type: 'text',
            analyzer: 'standard'
        },
        createdAt: { type: 'date' },
    }
};

/**
 * Initialize Elasticsearch indices
 */
export async function initializeIndices() {
    try {
        const indices = [
            { name: INDICES.USERS, mapping: USER_INDEX_MAPPING },
            { name: INDICES.PROJECTS, mapping: PROJECT_INDEX_MAPPING },
            { name: INDICES.COMMENTS, mapping: COMMENT_INDEX_MAPPING },
            { name: INDICES.TEAMS, mapping: TEAM_INDEX_MAPPING },
            { name: INDICES.FILES, mapping: FILE_INDEX_MAPPING },
        ];

        for (const index of indices) {
            const exists = await esClient.indices.exists({ index: index.name });

            if (!exists) {
                await esClient.indices.create({
                    index: index.name,
                    body: {
                        settings: {
                            number_of_shards: 1,
                            number_of_replicas: 1,
                            analysis: {
                                analyzer: {
                                    autocomplete: {
                                        tokenizer: 'autocomplete',
                                        filter: ['lowercase']
                                    }
                                },
                                tokenizer: {
                                    autocomplete: {
                                        type: 'edge_ngram',
                                        min_gram: 2,
                                        max_gram: 10,
                                        token_chars: ['letter', 'digit']
                                    }
                                }
                            }
                        },
                        mappings: index.mapping
                    }
                });
                logger.info(`Created index: ${index.name}`);
            } else {
                logger.info(`Index already exists: ${index.name}`);
            }
        }
    } catch (error) {
        logger.error('Error initializing indices:', error);
        throw error;
    }
}

/**
 * Health check for Elasticsearch
 */
export async function checkElasticsearchHealth() {
    try {
        const health = await esClient.cluster.health();
        return health.status !== 'red';
    } catch (error) {
        logger.error('Elasticsearch health check failed:', error);
        return false;
    }
}
