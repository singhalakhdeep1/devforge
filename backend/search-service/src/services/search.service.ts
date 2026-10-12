import { esClient, INDICES } from '../config/elasticsearch';
import { logger } from '../config/logger';
import * as natural from 'natural';
import * as stopword from 'stopword';

const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

interface SearchQuery {
    query: string;
    filters?: {
        type?: string[];
        tags?: string[];
        language?: string[];
        visibility?: string[];
        status?: string[];
        dateFrom?: string;
        dateTo?: string;
    };
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
    page?: number;
    limit?: number;
    fuzzy?: boolean;
    highlight?: boolean;
}

interface AutocompleteQuery {
    query: string;
    type: 'users' | 'projects' | 'teams';
    limit?: number;
}

interface AggregationResult {
    key: string;
    doc_count: number;
}

export class SearchService {
    /**
     * Universal search across all indices
     */
    async universalSearch(params: SearchQuery) {
        try {
            const {
                query,
                filters = {},
                sort = { field: '_score', order: 'desc' },
                page = 1,
                limit = 20,
                fuzzy = true,
                highlight = true
            } = params;

            const from = (page - 1) * limit;

            // Build query
            const must: any[] = [];
            const filter: any[] = [];

            if (query && query.trim()) {
                const multiMatchQuery: any = {
                    multi_match: {
                        query,
                        fields: [
                            'name^3',
                            'username^3',
                            'firstName^2',
                            'lastName^2',
                            'fullName^2',
                            'description^2',
                            'bio^2',
                            'content',
                            'tags',
                            'skills'
                        ],
                        type: 'best_fields',
                        operator: 'or',
                        minimum_should_match: '75%'
                    }
                };

                if (fuzzy) {
                    multiMatchQuery.multi_match.fuzziness = 'AUTO';
                }

                must.push(multiMatchQuery);
            } else {
                must.push({ match_all: {} });
            }

            // Apply filters
            if (filters.tags && filters.tags.length) {
                filter.push({ terms: { tags: filters.tags } });
            }

            if (filters.language && filters.language.length) {
                filter.push({ terms: { language: filters.language } });
            }

            if (filters.visibility && filters.visibility.length) {
                filter.push({ terms: { visibility: filters.visibility } });
            }

            if (filters.status && filters.status.length) {
                filter.push({ terms: { status: filters.status } });
            }

            if (filters.dateFrom || filters.dateTo) {
                const range: any = {};
                if (filters.dateFrom) range.gte = filters.dateFrom;
                if (filters.dateTo) range.lte = filters.dateTo;
                filter.push({ range: { createdAt: range } });
            }

            // Search across all indices
            const results = await esClient.search({
                index: [
                    INDICES.USERS,
                    INDICES.PROJECTS,
                    INDICES.TEAMS,
                    INDICES.COMMENTS,
                    INDICES.FILES
                ],
                from,
                size: limit,
                body: {
                    query: {
                        bool: {
                            must,
                            filter
                        }
                    },
                    sort: [
                        { [sort.field]: { order: sort.order } }
                    ],
                    highlight: highlight ? {
                        fields: {
                            name: {},
                            username: {},
                            description: {},
                            bio: {},
                            content: {},
                            tags: {}
                        },
                        pre_tags: ['<mark>'],
                        post_tags: ['</mark>']
                    } : undefined,
                    aggs: {
                        by_index: {
                            terms: { field: '_index' }
                        },
                        by_tags: {
                            terms: { field: 'tags', size: 20 }
                        },
                        by_language: {
                            terms: { field: 'language', size: 10 }
                        }
                    }
                }
            });

            return {
                hits: results.hits.hits.map(hit => ({
                    id: hit._id,
                    index: hit._index,
                    score: hit._score,
                    source: hit._source,
                    highlight: hit.highlight
                })),
                total: typeof results.hits.total === 'object'
                    ? results.hits.total.value
                    : results.hits.total,
                aggregations: {
                    byIndex: results.aggregations?.by_index.buckets || [],
                    byTags: results.aggregations?.by_tags.buckets || [],
                    byLanguage: results.aggregations?.by_language.buckets || []
                },
                page,
                limit,
                totalPages: Math.ceil(
                    (typeof results.hits.total === 'object'
                        ? results.hits.total.value
                        : results.hits.total) / limit
                )
            };
        } catch (error) {
            logger.error('Universal search error:', error);
            throw error;
        }
    }

    /**
     * Search users
     */
    async searchUsers(params: SearchQuery) {
        try {
            const {
                query,
                filters = {},
                sort = { field: '_score', order: 'desc' },
                page = 1,
                limit = 20,
                fuzzy = true
            } = params;

            const from = (page - 1) * limit;

            const must: any[] = [];
            const filter: any[] = [];

            if (query && query.trim()) {
                must.push({
                    multi_match: {
                        query,
                        fields: [
                            'username^3',
                            'firstName^2',
                            'lastName^2',
                            'fullName^2',
                            'email',
                            'bio',
                            'skills'
                        ],
                        fuzziness: fuzzy ? 'AUTO' : undefined
                    }
                });
            } else {
                must.push({ match_all: {} });
            }

            // Skills filter
            if (filters.tags && filters.tags.length) {
                filter.push({ terms: { skills: filters.tags } });
            }

            const results = await esClient.search({
                index: INDICES.USERS,
                from,
                size: limit,
                body: {
                    query: { bool: { must, filter } },
                    sort: [{ [sort.field]: { order: sort.order } }],
                    highlight: {
                        fields: {
                            username: {},
                            fullName: {},
                            bio: {},
                            skills: {}
                        }
                    }
                }
            });

            return this.formatSearchResults(results, page, limit);
        } catch (error) {
            logger.error('User search error:', error);
            throw error;
        }
    }

    /**
     * Search projects
     */
    async searchProjects(params: SearchQuery) {
        try {
            const {
                query,
                filters = {},
                sort = { field: '_score', order: 'desc' },
                page = 1,
                limit = 20,
                fuzzy = true
            } = params;

            const from = (page - 1) * limit;

            const must: any[] = [];
            const filter: any[] = [];
            const should: any[] = [];

            if (query && query.trim()) {
                // Boost exact name matches
                should.push({
                    match: {
                        'name.keyword': {
                            query,
                            boost: 5
                        }
                    }
                });

                // Standard multi-match
                must.push({
                    multi_match: {
                        query,
                        fields: [
                            'name^3',
                            'description^2',
                            'readme',
                            'tags^2',
                            'technologies'
                        ],
                        fuzziness: fuzzy ? 'AUTO' : undefined,
                        minimum_should_match: '75%'
                    }
                });
            } else {
                must.push({ match_all: {} });
            }

            // Apply filters
            if (filters.tags && filters.tags.length) {
                filter.push({ terms: { tags: filters.tags } });
            }

            if (filters.language && filters.language.length) {
                filter.push({ terms: { language: filters.language } });
            }

            if (filters.visibility && filters.visibility.length) {
                filter.push({ terms: { visibility: filters.visibility } });
            }

            if (filters.status && filters.status.length) {
                filter.push({ terms: { status: filters.status } });
            }

            const results = await esClient.search({
                index: INDICES.PROJECTS,
                from,
                size: limit,
                body: {
                    query: {
                        bool: {
                            must,
                            filter,
                            should,
                            minimum_should_match: should.length > 0 ? 0 : undefined
                        }
                    },
                    sort: [{ [sort.field]: { order: sort.order } }],
                    highlight: {
                        fields: {
                            name: {},
                            description: {},
                            readme: { fragment_size: 150, number_of_fragments: 3 },
                            tags: {},
                            technologies: {}
                        }
                    },
                    aggs: {
                        popular_tags: {
                            terms: { field: 'tags', size: 20, order: { _count: 'desc' } }
                        },
                        languages: {
                            terms: { field: 'language', size: 10 }
                        },
                        visibility_stats: {
                            terms: { field: 'visibility' }
                        },
                        status_stats: {
                            terms: { field: 'status' }
                        }
                    }
                }
            });

            return {
                ...this.formatSearchResults(results, page, limit),
                aggregations: {
                    popularTags: results.aggregations?.popular_tags.buckets || [],
                    languages: results.aggregations?.languages.buckets || [],
                    visibilityStats: results.aggregations?.visibility_stats.buckets || [],
                    statusStats: results.aggregations?.status_stats.buckets || []
                }
            };
        } catch (error) {
            logger.error('Project search error:', error);
            throw error;
        }
    }

    /**
     * Autocomplete suggestions
     */
    async autocomplete(params: AutocompleteQuery) {
        try {
            const { query, type, limit = 10 } = params;

            const index = type === 'users'
                ? INDICES.USERS
                : type === 'projects'
                    ? INDICES.PROJECTS
                    : INDICES.TEAMS;

            const field = type === 'users' ? 'username' : 'name';

            const results = await esClient.search({
                index,
                size: limit,
                body: {
                    suggest: {
                        autocomplete: {
                            prefix: query,
                            completion: {
                                field: `${field}.completion`,
                                skip_duplicates: true,
                                fuzzy: {
                                    fuzziness: 'AUTO'
                                }
                            }
                        }
                    }
                }
            });

            return results.suggest?.autocomplete[0].options.map(option => ({
                text: option.text,
                score: option._score,
                source: option._source
            })) || [];
        } catch (error) {
            logger.error('Autocomplete error:', error);
            throw error;
        }
    }

    /**
     * Advanced search with NLP
     */
    async nlpSearch(query: string, page = 1, limit = 20) {
        try {
            // Tokenize and remove stopwords
            const tokens = tokenizer.tokenize(query.toLowerCase());
            const cleanedTokens = stopword.removeStopwords(tokens || []);

            // Extract key terms using TF-IDF
            const tfidf = new TfIdf();
            tfidf.addDocument(cleanedTokens.join(' '));

            const keyTerms = cleanedTokens.slice(0, 5); // Top 5 terms

            // Search with boosted key terms
            return this.universalSearch({
                query: keyTerms.join(' '),
                page,
                limit,
                fuzzy: true,
                highlight: true
            });
        } catch (error) {
            logger.error('NLP search error:', error);
            throw error;
        }
    }

    /**
     * Similar items recommendation
     */
    async findSimilar(indexName: string, documentId: string, limit = 10) {
        try {
            const results = await esClient.search({
                index: indexName,
                size: limit,
                body: {
                    query: {
                        more_like_this: {
                            fields: ['name', 'description', 'tags', 'content'],
                            like: [
                                {
                                    _index: indexName,
                                    _id: documentId
                                }
                            ],
                            min_term_freq: 1,
                            max_query_terms: 12,
                            min_doc_freq: 1
                        }
                    }
                }
            });

            return results.hits.hits.map(hit => ({
                id: hit._id,
                score: hit._score,
                source: hit._source
            }));
        } catch (error) {
            logger.error('Find similar error:', error);
            throw error;
        }
    }

    /**
     * Index a document
     */
    async indexDocument(index: string, id: string, document: any) {
        try {
            await esClient.index({
                index,
                id,
                body: document,
                refresh: 'wait_for'
            });
            logger.info(`Indexed document ${id} in ${index}`);
        } catch (error) {
            logger.error('Index document error:', error);
            throw error;
        }
    }

    /**
     * Bulk index documents
     */
    async bulkIndex(index: string, documents: Array<{ id: string; doc: any }>) {
        try {
            const body = documents.flatMap(({ id, doc }) => [
                { index: { _index: index, _id: id } },
                doc
            ]);

            const result = await esClient.bulk({
                body,
                refresh: 'wait_for'
            });

            if (result.errors) {
                const erroredDocuments = result.items.filter((item: any) => item.index?.error);
                logger.error('Bulk index errors:', erroredDocuments);
            }

            logger.info(`Bulk indexed ${documents.length} documents in ${index}`);
            return result;
        } catch (error) {
            logger.error('Bulk index error:', error);
            throw error;
        }
    }

    /**
     * Update a document
     */
    async updateDocument(index: string, id: string, document: Partial<any>) {
        try {
            await esClient.update({
                index,
                id,
                body: {
                    doc: document
                },
                refresh: 'wait_for'
            });
            logger.info(`Updated document ${id} in ${index}`);
        } catch (error) {
            logger.error('Update document error:', error);
            throw error;
        }
    }

    /**
     * Delete a document
     */
    async deleteDocument(index: string, id: string) {
        try {
            await esClient.delete({
                index,
                id,
                refresh: 'wait_for'
            });
            logger.info(`Deleted document ${id} from ${index}`);
        } catch (error) {
            logger.error('Delete document error:', error);
            throw error;
        }
    }

    /**
     * Get search suggestions based on popular queries
     */
    async getSearchSuggestions(prefix: string, limit = 5) {
        try {
            // This would typically query a separate index of popular searches
            // For now, we'll return autocomplete from projects and users
            const [projects, users] = await Promise.all([
                this.autocomplete({ query: prefix, type: 'projects', limit: 3 }),
                this.autocomplete({ query: prefix, type: 'users', limit: 2 })
            ]);

            return {
                projects: projects.slice(0, 3),
                users: users.slice(0, 2)
            };
        } catch (error) {
            logger.error('Get suggestions error:', error);
            throw error;
        }
    }

    /**
     * Format search results
     */
    private formatSearchResults(results: any, page: number, limit: number) {
        const total = typeof results.hits.total === 'object'
            ? results.hits.total.value
            : results.hits.total;

        return {
            hits: results.hits.hits.map((hit: any) => ({
                id: hit._id,
                score: hit._score,
                source: hit._source,
                highlight: hit.highlight
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
}
