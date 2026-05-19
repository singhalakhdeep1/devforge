import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket/bin/server';
import * as awarenessProtocol from 'y-protocols/awareness';
import { logger } from '../config/logger';

interface Document {
    id: string;
    yDoc: Y.Doc;
    awareness: awarenessProtocol.Awareness;
    connections: Set<any>;
    lastModified: Date;
    autoSaveTimer?: NodeJS.Timeout;
}

interface DocumentMetadata {
    id: string;
    title: string;
    content: string;
    version: number;
    ownerId: string;
    collaborators: string[];
    lastModified: Date;
    createdAt: Date;
}

interface UserCursor {
    userId: string;
    username: string;
    color: string;
    selection: {
        anchor: number;
        head: number;
    } | null;
}

export class EditorService {
    private documents: Map<string, Document> = new Map();
    private documentMetadata: Map<string, DocumentMetadata> = new Map();
    private userColors: Map<string, string> = new Map();
    private autoSaveInterval = 30000; // 30 seconds

    constructor() {
        // Cleanup old documents every hour
        setInterval(() => this.cleanupOldDocuments(), 3600000);
    }

    /**
     * Get or create a document
     */
    getOrCreateDocument(documentId: string): Document {
        try {
            if (this.documents.has(documentId)) {
                const doc = this.documents.get(documentId)!;
                doc.lastModified = new Date();
                return doc;
            }

            // Create new Yjs document
            const yDoc = new Y.Doc();
            const awareness = new awarenessProtocol.Awareness(yDoc);

            const document: Document = {
                id: documentId,
                yDoc,
                awareness,
                connections: new Set(),
                lastModified: new Date(),
            };

            // Setup auto-save
            this.setupAutoSave(documentId, yDoc);

            // Listen to document updates
            yDoc.on('update', (update: Uint8Array, origin: any) => {
                this.onDocumentUpdate(documentId, update, origin);
            });

            this.documents.set(documentId, document);
            logger.info(`Created document ${documentId}`);

            return document;
        } catch (error) {
            logger.error('Error getting/creating document:', error);
            throw error;
        }
    }

    /**
     * Get document by ID
     */
    getDocument(documentId: string): Document | undefined {
        return this.documents.get(documentId);
    }

    /**
     * Add connection to document
     */
    addConnection(documentId: string, connection: any) {
        const document = this.getOrCreateDocument(documentId);
        document.connections.add(connection);
        logger.info(`Added connection to document ${documentId}. Total: ${document.connections.size}`);
    }

    /**
     * Remove connection from document
     */
    removeConnection(documentId: string, connection: any) {
        const document = this.documents.get(documentId);
        if (document) {
            document.connections.delete(connection);
            logger.info(`Removed connection from document ${documentId}. Total: ${document.connections.size}`);

            // Cleanup document if no connections
            if (document.connections.size === 0) {
                this.scheduleDocumentCleanup(documentId);
            }
        }
    }

    /**
     * Apply update to document
     */
    applyUpdate(documentId: string, update: Uint8Array, origin?: any) {
        try {
            const document = this.documents.get(documentId);
            if (!document) {
                throw new Error('Document not found');
            }

            Y.applyUpdate(document.yDoc, update, origin);
            document.lastModified = new Date();

            logger.debug(`Applied update to document ${documentId}`);
        } catch (error) {
            logger.error('Error applying update:', error);
            throw error;
        }
    }

    /**
     * Get document state
     */
    getDocumentState(documentId: string): Uint8Array {
        const document = this.documents.get(documentId);
        if (!document) {
            throw new Error('Document not found');
        }

        return Y.encodeStateAsUpdate(document.yDoc);
    }

    /**
     * Get document as text
     */
    getDocumentText(documentId: string): string {
        const document = this.documents.get(documentId);
        if (!document) {
            throw new Error('Document not found');
        }

        const textType = document.yDoc.getText('content');
        return textType.toString();
    }

    /**
     * Set document metadata
     */
    setDocumentMetadata(documentId: string, metadata: Partial<DocumentMetadata>) {
        const existing = this.documentMetadata.get(documentId);
        const updated: DocumentMetadata = {
            id: documentId,
            title: metadata.title || existing?.title || 'Untitled',
            content: metadata.content || existing?.content || '',
            version: (existing?.version || 0) + 1,
            ownerId: metadata.ownerId || existing?.ownerId || '',
            collaborators: metadata.collaborators || existing?.collaborators || [],
            lastModified: new Date(),
            createdAt: existing?.createdAt || new Date(),
        };

        this.documentMetadata.set(documentId, updated);
        logger.info(`Updated metadata for document ${documentId}`);

        return updated;
    }

    /**
     * Get document metadata
     */
    getDocumentMetadata(documentId: string): DocumentMetadata | undefined {
        return this.documentMetadata.get(documentId);
    }

    /**
     * Update user awareness (cursor, selection, etc.)
     */
    updateUserAwareness(documentId: string, userId: string, state: any) {
        const document = this.documents.get(documentId);
        if (!document) {
            throw new Error('Document not found');
        }

        const clientId = this.getUserClientId(userId);
        document.awareness.setLocalStateField(clientId, state);

        logger.debug(`Updated awareness for user ${userId} in document ${documentId}`);
    }

    /**
     * Get all users in document
     */
    getDocumentUsers(documentId: string): UserCursor[] {
        const document = this.documents.get(documentId);
        if (!document) {
            return [];
        }

        const users: UserCursor[] = [];
        document.awareness.getStates().forEach((state: any, clientId: number) => {
            if (state.user) {
                users.push({
                    userId: state.user.id,
                    username: state.user.name,
                    color: this.getUserColor(state.user.id),
                    selection: state.selection || null,
                });
            }
        });

        return users;
    }

    /**
     * Get user color
     */
    getUserColor(userId: string): string {
        if (this.userColors.has(userId)) {
            return this.userColors.get(userId)!;
        }

        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
            '#F8B739', '#52B788', '#E07A5F', '#81B29A'
        ];

        const color = colors[Math.floor(Math.random() * colors.length)];
        this.userColors.set(userId, color);
        return color;
    }

    /**
     * Create document snapshot
     */
    async createSnapshot(documentId: string): Promise<{
        documentId: string;
        snapshot: Uint8Array;
        timestamp: Date;
    }> {
        try {
            const document = this.documents.get(documentId);
            if (!document) {
                throw new Error('Document not found');
            }

            const snapshot = Y.encodeStateAsUpdate(document.yDoc);

            logger.info(`Created snapshot for document ${documentId}`);

            return {
                documentId,
                snapshot,
                timestamp: new Date(),
            };
        } catch (error) {
            logger.error('Error creating snapshot:', error);
            throw error;
        }
    }

    /**
     * Restore document from snapshot
     */
    async restoreSnapshot(documentId: string, snapshot: Uint8Array) {
        try {
            const document = this.getOrCreateDocument(documentId);

            // Clear current state
            const currentState = Y.encodeStateAsUpdate(document.yDoc);
            const emptyDoc = new Y.Doc();
            Y.applyUpdate(document.yDoc, Y.diffUpdate(currentState, Y.encodeStateAsUpdate(emptyDoc)));

            // Apply snapshot
            Y.applyUpdate(document.yDoc, snapshot);

            document.lastModified = new Date();

            logger.info(`Restored document ${documentId} from snapshot`);
        } catch (error) {
            logger.error('Error restoring snapshot:', error);
            throw error;
        }
    }

    /**
     * Get document history
     */
    getDocumentHistory(documentId: string): any[] {
        // This would typically fetch from database
        // For now, return empty array
        return [];
    }

    /**
     * Export document as JSON
     */
    exportAsJSON(documentId: string): any {
        const document = this.documents.get(documentId);
        if (!document) {
            throw new Error('Document not found');
        }

        const text = this.getDocumentText(documentId);
        const metadata = this.documentMetadata.get(documentId);

        return {
            id: documentId,
            text,
            metadata,
            exportedAt: new Date(),
        };
    }

    /**
     * Export document as Markdown
     */
    exportAsMarkdown(documentId: string): string {
        const text = this.getDocumentText(documentId);
        const metadata = this.documentMetadata.get(documentId);

        let markdown = '';
        if (metadata?.title) {
            markdown += `# ${metadata.title}\n\n`;
        }

        markdown += text;
        markdown += `\n\n---\n*Last modified: ${metadata?.lastModified.toISOString()}*`;

        return markdown;
    }

    /**
     * Get document statistics
     */
    getDocumentStats(documentId: string) {
        const document = this.documents.get(documentId);
        if (!document) {
            throw new Error('Document not found');
        }

        const text = this.getDocumentText(documentId);
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const chars = text.length;
        const lines = text.split('\n').length;

        return {
            documentId,
            words: words.length,
            characters: chars,
            lines,
            connections: document.connections.size,
            lastModified: document.lastModified,
        };
    }

    /**
     * Get all active documents
     */
    getAllDocuments() {
        return Array.from(this.documents.keys()).map(id => ({
            id,
            connections: this.documents.get(id)!.connections.size,
            lastModified: this.documents.get(id)!.lastModified,
        }));
    }

    /**
     * Setup auto-save for document
     */
    private setupAutoSave(documentId: string, yDoc: Y.Doc) {
        const document = this.documents.get(documentId);
        if (!document) return;

        document.autoSaveTimer = setInterval(() => {
            this.saveDocument(documentId);
        }, this.autoSaveInterval);
    }

    /**
     * Save document to database
     */
    private async saveDocument(documentId: string) {
        try {
            const text = this.getDocumentText(documentId);
            const metadata = this.documentMetadata.get(documentId);

            if (metadata) {
                metadata.content = text;
                metadata.lastModified = new Date();

                // Here you would save to database
                logger.info(`Auto-saved document ${documentId}`);
            }
        } catch (error) {
            logger.error('Error auto-saving document:', error);
        }
    }

    /**
     * Handle document update
     */
    private onDocumentUpdate(documentId: string, update: Uint8Array, origin: any) {
        const document = this.documents.get(documentId);
        if (!document) return;

        document.lastModified = new Date();

        // Broadcast update to all connections except origin
        document.connections.forEach((conn: any) => {
            if (conn !== origin) {
                try {
                    conn.send(update);
                } catch (error) {
                    logger.error('Error broadcasting update:', error);
                }
            }
        });
    }

    /**
     * Schedule document cleanup
     */
    private scheduleDocumentCleanup(documentId: string) {
        setTimeout(() => {
            const document = this.documents.get(documentId);
            if (document && document.connections.size === 0) {
                // Final save before cleanup
                this.saveDocument(documentId);

                // Clear auto-save timer
                if (document.autoSaveTimer) {
                    clearInterval(document.autoSaveTimer);
                }

                // Remove document
                this.documents.delete(documentId);
                logger.info(`Cleaned up document ${documentId}`);
            }
        }, 300000); // 5 minutes
    }

    /**
     * Cleanup old documents (no connections for > 1 hour)
     */
    private cleanupOldDocuments() {
        const oneHourAgo = new Date(Date.now() - 3600000);

        this.documents.forEach((document, documentId) => {
            if (document.connections.size === 0 && document.lastModified < oneHourAgo) {
                logger.info(`Cleaning up old document ${documentId}`);
                this.saveDocument(documentId);

                if (document.autoSaveTimer) {
                    clearInterval(document.autoSaveTimer);
                }

                this.documents.delete(documentId);
            }
        });
    }

    /**
     * Get user client ID (deterministic)
     */
    private getUserClientId(userId: string): number {
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = ((hash << 5) - hash) + userId.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
}
