import type { estypes } from '@elastic/elasticsearch'
import { createLogger } from '@devhub/shared'
import { es } from './client'

const log = createLogger('elasticsearch')

/** Logical index names. Each one is an alias that points at a versioned physical index. */
export const INDEX = {
  courses: 'devforge_courses',
  users: 'devforge_users',
  projects: 'devforge_projects',
} as const
export type IndexAlias = (typeof INDEX)[keyof typeof INDEX]

const analysis: estypes.IndicesIndexSettingsAnalysis = {
  filter: {
    autocomplete_filter: { type: 'edge_ngram', min_gram: 2, max_gram: 20 },
    english_stop: { type: 'stop', stopwords: '_english_' },
    english_stemmer: { type: 'stemmer', language: 'english' },
  },
  normalizer: { lowercase_norm: { type: 'custom', filter: ['lowercase'] } },
  analyzer: {
    autocomplete: { type: 'custom', tokenizer: 'standard', filter: ['lowercase', 'autocomplete_filter'] },
    autocomplete_search: { type: 'custom', tokenizer: 'standard', filter: ['lowercase'] },
    content: { type: 'custom', tokenizer: 'standard', filter: ['lowercase', 'english_stop', 'english_stemmer'] },
  },
}

const nameField: estypes.MappingProperty = {
  type: 'text',
  analyzer: 'content',
  fields: { keyword: { type: 'keyword', ignore_above: 256 }, autocomplete: { type: 'text', analyzer: 'autocomplete', search_analyzer: 'autocomplete_search' } },
}

export const DEFINITIONS: Record<IndexAlias, { mappings: estypes.MappingTypeMapping }> = {
  [INDEX.courses]: {
    mappings: {
      dynamic: 'strict',
      properties: {
        id: { type: 'integer' },
        title: nameField,
        description: { type: 'text', analyzer: 'content' },
        category: { type: 'keyword' },
        level: { type: 'keyword' },
        price: { type: 'float' },
        thumbnailUrl: { type: 'keyword', index: false },
        instructor: { properties: { id: { type: 'keyword' }, name: nameField } },
        modules: { type: 'text', analyzer: 'content' },
        lessons: { type: 'text', analyzer: 'content' },
        lessonCount: { type: 'integer' },
        totalMinutes: { type: 'integer' },
        students: { type: 'integer' },
        rating: { type: 'float' },
        ratingCount: { type: 'integer' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
      },
    },
  },
  [INDEX.users]: {
    mappings: {
      dynamic: 'strict',
      properties: {
        id: { type: 'keyword' },
        name: nameField,
        bio: { type: 'text', analyzer: 'content' },
        skills: { type: 'text', analyzer: 'content', fields: { keyword: { type: 'keyword', ignore_above: 64 } } },
        location: { type: 'text' },
        role: { type: 'keyword' },
        avatar: { type: 'keyword', index: false },
        createdAt: { type: 'date' },
      },
    },
  },
  [INDEX.projects]: {
    mappings: {
      dynamic: 'strict',
      properties: {
        id: { type: 'keyword' },
        name: nameField,
        slug: { type: 'keyword' },
        description: { type: 'text', analyzer: 'content' },
        readme: { type: 'text', analyzer: 'content' },
        tags: { type: 'text', analyzer: 'content', fields: { keyword: { type: 'keyword', ignore_above: 64, normalizer: 'lowercase_norm' } } },
        visibility: { type: 'keyword' },
        ownerId: { type: 'keyword' },
        ownerName: { type: 'text' },
        stars: { type: 'integer' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
      },
    },
  },
}

const physical = (alias: string, version: number) => `${alias}_v${version}`

/** The physical indices an alias points at (empty if the alias does not exist yet). */
export async function aliasTargets(alias: string): Promise<string[]> {
  try {
    return Object.keys(await es().indices.getAlias({ name: alias }))
  } catch (e) {
    if ((e as { meta?: { statusCode?: number } }).meta?.statusCode === 404) return []
    throw e
  }
}

async function createVersion(alias: IndexAlias, version: number) {
  await es().indices.create({
    index: physical(alias, version),
    settings: { number_of_shards: 1, number_of_replicas: 0, analysis },
    mappings: DEFINITIONS[alias].mappings,
  })
}

/** Creates `<alias>_v1` and the alias if they are missing. Safe to call on every start. */
export async function ensureIndices(): Promise<void> {
  for (const alias of Object.values(INDEX)) {
    if ((await aliasTargets(alias)).length > 0) continue
    try {
      await createVersion(alias, 1)
    } catch (e) {
      if (!String(e).includes('resource_already_exists')) throw e
    }
    await es().indices.putAlias({ index: physical(alias, 1), name: alias })
    log.logInformation('created index', { alias, index: physical(alias, 1) })
  }
}

/**
 * Zero-downtime reindex: build a new versioned index from `source`, atomically move the alias to it,
 * then drop the old one. Readers keep using the alias throughout.
 */
export async function rebuildIndex<T extends { id: string | number }>(alias: IndexAlias, source: AsyncIterable<T[]>): Promise<{ index: string; documents: number; previous: string[] }> {
  const previous = await aliasTargets(alias)
  const current = previous.map((n) => Number(/_v(\d+)$/.exec(n)?.[1] ?? 0))
  const next = (current.length ? Math.max(...current) : 0) + 1
  await createVersion(alias, next)
  const index = physical(alias, next)

  let documents = 0
  try {
    for await (const batch of source) {
      if (batch.length === 0) continue
      const res = await es().bulk({ refresh: false, operations: batch.flatMap((d) => [{ index: { _index: index, _id: String(d.id) } }, d]) })
      if (res.errors) throw new Error('bulk indexing reported errors: ' + JSON.stringify(res.items.find((i) => i.index?.error)?.index?.error))
      documents += batch.length
    }
    await es().indices.refresh({ index })
  } catch (e) {
    await es().indices.delete({ index }).catch(() => undefined) // never leave a half-built index around
    throw e
  }

  await es().indices.updateAliases({
    actions: [...previous.map((p) => ({ remove: { index: p, alias } })), { add: { index, alias } }],
  })
  for (const p of previous) await es().indices.delete({ index: p }).catch(() => undefined)
  return { index, documents, previous }
}

export async function indexDoc(alias: IndexAlias, id: string | number, doc: object) {
  await es().index({ index: alias, id: String(id), document: doc, refresh: false })
}

export async function removeDoc(alias: IndexAlias, id: string | number) {
  try {
    await es().delete({ index: alias, id: String(id), refresh: false })
  } catch (e) {
    if ((e as { meta?: { statusCode?: number } }).meta?.statusCode !== 404) throw e
  }
}
