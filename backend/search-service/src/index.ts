import { esHealthy, ensureIndices } from '@devhub/elasticsearch-service'
import { createEventBus, createLogger, redisHealthy, startService } from '@devhub/shared'
import { backfillIfEmpty, startIndexing } from './indexer'
import router from './routes'

const log = createLogger('search')

/** Elasticsearch may still be starting when this service does: keep trying instead of crashing. */
async function connectWithRetry() {
  for (let attempt = 1; ; attempt++) {
    try {
      await ensureIndices()
      return
    } catch (e) {
      log.logWarning('Elasticsearch not ready yet', { attempt, error: String(e).slice(0, 160) })
      await new Promise((r) => setTimeout(r, Math.min(15_000, attempt * 2000)))
    }
  }
}

void startService({
  name: 'search',
  trustProxy: true,
  cors: false,
  routes: (app) => {
    app.use('/api/search', router)
  },
  ready: { elasticsearch: () => esHealthy(), redis: () => redisHealthy() },
  onStart: () => {
    // do not block the HTTP server on the search cluster: /ready reports it while it comes up
    void connectWithRetry()
      .then(startIndexing)
      .then(backfillIfEmpty)
      .catch((e) => log.logError('search startup failed', String(e)))
  },
  onStop: async () => {
    await createEventBus('search').close()
  },
}).catch((e) => {
  console.error('search-service failed to start', e)
  process.exit(1)
})
