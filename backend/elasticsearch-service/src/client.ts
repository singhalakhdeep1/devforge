import { Client } from '@elastic/elasticsearch'
import { env } from '@devhub/shared'

let client: Client | null = null

/** One client per process. Errors are thrown (not swallowed) so callers can retry or report them. */
export function es(): Client {
  client ??= new Client({
    node: env('ELASTICSEARCH_URL', 'http://localhost:9200'),
    auth: env('ELASTICSEARCH_USERNAME') ? { username: env('ELASTICSEARCH_USERNAME'), password: env('ELASTICSEARCH_PASSWORD') } : undefined,
    maxRetries: 3,
    requestTimeout: 30_000,
  })
  return client
}

export async function esHealthy(): Promise<boolean> {
  try {
    const h = await es().cluster.health({ timeout: '2s' })
    return h.status !== 'red'
  } catch {
    return false
  }
}
