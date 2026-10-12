import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { join } from 'path';
import { resolvers, createContext } from './resolvers';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Load schema
const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf-8');

// Create executable schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// WebSocket server for subscriptions
const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql'
});

const serverCleanup = useServer({ schema, context: createContext }, wsServer);

// Apollo Server
const server = new ApolloServer({
    schema,
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await serverCleanup.dispose();
                    }
                };
            }
        }
    ]
});

async function startServer() {
    await server.start();

    app.use(
        '/graphql',
        cors<cors.CorsRequest>({
            origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
            credentials: true
        }),
        express.json(),
        expressMiddleware(server, {
            context: async ({ req }) => createContext(req)
        })
    );

    // Health check
    app.get('/health', (req, res) => {
        res.json({ status: 'OK', service: 'graphql-api' });
    });

    const PORT = process.env.PORT || 3012;

    httpServer.listen(PORT, () => {
        console.log(`🚀 GraphQL Server running on http://localhost:${PORT}/graphql`);
        console.log(`🔌 WebSocket Server running on ws://localhost:${PORT}/graphql`);
    });
}

startServer().catch(console.error);
