import { WebSocketServer, WebSocket } from 'ws';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import { EditorService } from '../services/editor.service';
import { logger } from '../config/logger';

const messageSync = 0;
const messageAwareness = 1;

interface WSConnection extends WebSocket {
    documentId?: string;
    userId?: string;
    isAlive?: boolean;
}

export function setupEditorWebSocket(wss: WebSocketServer, editorService: EditorService) {
    // Heartbeat to detect dead connections
    const heartbeatInterval = setInterval(() => {
        wss.clients.forEach((ws: WSConnection) => {
            if (ws.isAlive === false) {
                if (ws.documentId && ws.userId) {
                    editorService.removeConnection(ws.documentId, ws);
                }
                return ws.terminate();
            }

            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on('close', () => {
        clearInterval(heartbeatInterval);
    });

    wss.on('connection', (ws: WSConnection, request) => {
        ws.isAlive = true;

        ws.on('pong', () => {
            ws.isAlive = true;
        });

        // Extract document ID from URL
        const url = new URL(request.url!, `http://${request.headers.host}`);
        const documentId = url.searchParams.get('documentId');
        const userId = url.searchParams.get('userId');
        const username = url.searchParams.get('username') || 'Anonymous';

        if (!documentId || !userId) {
            ws.close(4000, 'Missing documentId or userId');
            return;
        }

        ws.documentId = documentId;
        ws.userId = userId;

        logger.info(`User ${userId} connected to document ${documentId}`);

        // Get or create document
        const document = editorService.getOrCreateDocument(documentId);
        editorService.addConnection(documentId, ws);

        // Setup awareness
        document.awareness.setLocalStateField(userId, {
            user: {
                id: userId,
                name: username,
            },
        });

        // Send initial sync
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.writeSyncStep1(encoder, document.yDoc);
        ws.send(encoding.toUint8Array(encoder));

        // Send awareness states
        const awarenessEncoder = encoding.createEncoder();
        encoding.writeVarUint(awarenessEncoder, messageAwareness);
        encoding.writeVarUint8Array(
            awarenessEncoder,
            awarenessProtocol.encodeAwarenessUpdate(document.awareness, Array.from(document.awareness.getStates().keys()))
        );
        ws.send(encoding.toUint8Array(awarenessEncoder));

        // Handle messages
        ws.on('message', (message: Buffer) => {
            try {
                const decoder = decoding.createDecoder(new Uint8Array(message));
                const messageType = decoding.readVarUint(decoder);

                if (messageType === messageSync) {
                    handleSyncMessage(decoder, document, ws, editorService);
                } else if (messageType === messageAwareness) {
                    handleAwarenessMessage(decoder, document, ws);
                }
            } catch (error) {
                logger.error('Error handling message:', error);
            }
        });

        // Handle disconnect
        ws.on('close', () => {
            logger.info(`User ${userId} disconnected from document ${documentId}`);
            editorService.removeConnection(documentId, ws);

            // Remove from awareness
            document.awareness.setLocalStateField(userId, null);
        });
    });
}

function handleSyncMessage(
    decoder: decoding.Decoder,
    document: any,
    ws: WSConnection,
    editorService: EditorService
) {
    const encoder = encoding.createEncoder();
    const messageType = syncProtocol.readSyncMessage(decoder, encoder, document.yDoc, ws);

    if (encoding.length(encoder) > 1) {
        ws.send(encoding.toUint8Array(encoder));
    }

    // Broadcast updates to other clients
    if (messageType === syncProtocol.messageYjsSyncStep2 && ws.documentId) {
        broadcastUpdate(document, ws);
    }
}

function handleAwarenessMessage(
    decoder: decoding.Decoder,
    document: any,
    ws: WSConnection
) {
    awarenessProtocol.applyAwarenessUpdate(
        document.awareness,
        decoding.readVarUint8Array(decoder),
        ws
    );
}

function broadcastUpdate(document: any, origin: WSConnection) {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeUpdate(encoder, Y.encodeStateAsUpdate(document.yDoc));
    const message = encoding.toUint8Array(encoder);

    document.connections.forEach((conn: WSConnection) => {
        if (conn !== origin && conn.readyState === WebSocket.OPEN) {
            conn.send(message);
        }
    });
}
