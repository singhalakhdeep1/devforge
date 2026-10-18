/**
 * tRPC API at /trpc (HTTP, batching enabled). Reached through the gateway, which verifies the
 * token and forwards the identity; `attachUser` reads it into the procedure context.
 */
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { attachUser, createLogger, startService, type AuthUser } from '@devhub/shared'
import { appRouter } from './router'

const log = createLogger('trpc')

void startService({
  name: 'trpc',
  trustProxy: true,
  cors: false,
  routes: (app) => {
    app.use(
      '/trpc',
      attachUser,
      createExpressMiddleware({
        router: appRouter,
        createContext: ({ req }) => ({ user: (req as unknown as { user?: AuthUser }).user }),
        onError: ({ path, error }) => {
          if (error.code === 'INTERNAL_SERVER_ERROR') log.logError('tRPC procedure failed', error.message, { path })
        },
      }),
    )
  },
})

export type { AppRouter } from './router'
