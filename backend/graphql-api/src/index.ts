/**
 * GraphQL API: Apollo Server over HTTP (POST /graphql) and graphql-ws subscriptions on the same path
 * (WebSocket). Reached through the gateway, which verifies the token and forwards the identity;
 * subscriptions authenticate with `connectionParams.authToken`.
 */
import fs from 'node:fs'
import path from 'node:path'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { RealtimeHub, createSubscriptionResolvers, subscriptionTypeDefs } from '@devhub/graphql-subscriptions'
import { attachUser, createLogger, envBool, isProd, redisHealthy, startService, verifyAccessToken, type AuthUser } from '@devhub/shared'
import { useServer } from 'graphql-ws/lib/use/ws'
import { WebSocketServer } from 'ws'
import { resolvers, type Context } from './resolvers'

const log = createLogger('graphql')
const typeDefs = fs.readFileSync(path.join(__dirname, '..', 'src', 'schema.graphql'), 'utf8')
const hub = new RealtimeHub()
const subscriptions = createSubscriptionResolvers(hub)
const schema = makeExecutableSchema({ typeDefs: [typeDefs, subscriptionTypeDefs], resolvers: [resolvers, subscriptions] })

let apollo: ApolloServer<Context> | undefined
let wsCleanup: { dispose: () => Promise<void> | void } | undefined

void startService({
  name: 'graphql',
  trustProxy: true,
  cors: false,
  routes: async (app, server) => {
    const wss = new WebSocketServer({ server, path: '/graphql' })
    wsCleanup = useServer(
      {
        schema,
        context: async (ctx): Promise<Context> => {
          const token = ctx.connectionParams?.authToken
          if (typeof token !== 'string' || !token) return {}
          try {
            return { user: verifyAccessToken(token.replace(/^Bearer\s+/i, '')) }
          } catch {
            throw new Error('Invalid token')
          }
        },
      },
      wss,
    )

    apollo = new ApolloServer<Context>({
      schema,
      introspection: envBool('GRAPHQL_INTROSPECTION', !isProd()),
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer: server }),
        { async serverWillStart() { return { async drainServer() { await wsCleanup?.dispose() } } } },
      ],
      formatError: (formatted) => {
        if (formatted.extensions?.code === 'INTERNAL_SERVER_ERROR' && isProd()) return { ...formatted, message: 'Internal server error' }
        return formatted
      },
    })
    await apollo.start()
    app.use('/graphql', attachUser, expressMiddleware(apollo, { context: async ({ req }) => ({ user: (req as unknown as { user?: AuthUser }).user }) }))
  },
  ready: { redis: () => redisHealthy() },
  onStart: async () => {
    await hub.start()
    log.logInformation('GraphQL ready at /graphql (subscriptions over graphql-ws)')
  },
  onStop: async () => {
    await apollo?.stop()
    await hub.close()
  },
})
