/**
 * Operations API for the Elasticsearch cluster (admins only, reached through the gateway at
 * /api/admin/search-engine). The data path (indexing and querying) lives in search-service.
 */
import { Router } from 'express'
import { AppError, asyncHandler, requireRole, startService } from '@devhub/shared'
import { es, esHealthy } from './client'
import { INDEX, aliasTargets, ensureIndices } from './indices'

const router = Router()
router.use(requireRole('ADMIN'))

router.get('/health', asyncHandler(async (_req, res) => {
  const [health, info] = await Promise.all([es().cluster.health(), es().info()])
  res.json({ cluster: info.cluster_name, version: info.version.number, status: health.status, nodes: health.number_of_nodes, activeShards: health.active_shards, unassignedShards: health.unassigned_shards })
}))

router.get('/indices', asyncHandler(async (_req, res) => {
  const rows = await es().cat.indices({ format: 'json', index: 'devforge_*', bytes: 'b' })
  const out = [] as { alias: string; indices: unknown[] }[]
  for (const alias of Object.values(INDEX)) {
    const targets = await aliasTargets(alias)
    out.push({ alias, indices: rows.filter((r) => targets.includes(String(r.index))).map((r) => ({ index: r.index, health: r.health, documents: Number(r['docs.count']), bytes: Number(r['store.size']) })) })
  }
  const orphans = rows.filter((r) => !out.some((o) => o.indices.some((i) => (i as { index: string }).index === r.index))).map((r) => r.index)
  res.json({ aliases: out, orphans })
}))

router.post('/ensure', asyncHandler(async (_req, res) => {
  await ensureIndices()
  res.json({ message: 'Indices and aliases are in place' })
}))

// Old versions left behind by an interrupted reindex; indices an alias still points at are protected
router.delete('/indices/:name', asyncHandler(async (req, res) => {
  const name = req.params.name
  if (!/^devforge_[a-z]+_v\d+$/.test(name)) throw AppError.badRequest('Only versioned devforge indices can be deleted')
  for (const alias of Object.values(INDEX)) {
    if ((await aliasTargets(alias)).includes(name)) throw AppError.conflict('That index is live (an alias points at it)')
  }
  try {
    await es().indices.delete({ index: name })
  } catch (e) {
    if ((e as { meta?: { statusCode?: number } }).meta?.statusCode === 404) throw AppError.notFound('No such index')
    throw e
  }
  res.json({ message: `Deleted ${name}` })
}))

void startService({
  name: 'elasticsearch',
  port: Number(process.env.PORT) || 4018,
  trustProxy: true,
  cors: false,
  routes: (app) => {
    app.use('/api/admin/search-engine', router)
  },
  ready: { elasticsearch: () => esHealthy() },
}).catch((e) => {
  console.error('elasticsearch-service failed to start', e)
  process.exit(1)
})
