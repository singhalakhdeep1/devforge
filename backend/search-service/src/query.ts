import type { estypes } from '@elastic/elasticsearch'
import { INDEX, es } from '@devhub/elasticsearch-service'

export interface CourseFilters {
  q?: string
  category?: string
  level?: string
  minPrice?: number
  maxPrice?: number
  free?: boolean
  minRating?: number
  sort?: 'relevance' | 'newest' | 'popular' | 'rating' | 'price_asc' | 'price_desc'
  page: number
  pageSize: number
}

const sorts: Record<string, estypes.Sort> = {
  newest: [{ createdAt: 'desc' }],
  popular: [{ students: 'desc' }, { rating: 'desc' }],
  rating: [{ rating: 'desc' }, { ratingCount: 'desc' }],
  price_asc: [{ price: 'asc' }],
  price_desc: [{ price: 'desc' }],
}

/** Words typed so far count for something even before the term is complete ("pyth" finds Python). */
const textQuery = (q: string): estypes.QueryDslQueryContainer => ({
  bool: {
    should: [
      { multi_match: { query: q, fields: ['title^5', 'instructor.name^3', 'category^2', 'description^1.5', 'modules^1.5', 'lessons'], type: 'best_fields', fuzziness: 'AUTO', prefix_length: 1, operator: 'or', minimum_should_match: '60%' } },
      { match: { 'title.autocomplete': { query: q, boost: 2 } } },
      { match_phrase: { title: { query: q, boost: 4 } } },
    ],
    minimum_should_match: 1,
  },
})

export async function searchCourses(f: CourseFilters) {
  // Filters that always apply, and the "selection" filters (category, level) which facets must ignore
  // for themselves: choosing a category must not make the other categories disappear from the sidebar.
  const filter: estypes.QueryDslQueryContainer[] = []
  if (f.free) filter.push({ term: { price: 0 } })
  else if (f.minPrice !== undefined || f.maxPrice !== undefined) filter.push({ range: { price: { ...(f.minPrice !== undefined ? { gte: f.minPrice } : {}), ...(f.maxPrice !== undefined ? { lte: f.maxPrice } : {}) } } })
  if (f.minRating) filter.push({ range: { rating: { gte: f.minRating } } })

  const categoryClause: estypes.QueryDslQueryContainer | undefined = f.category ? { term: { category: f.category } } : undefined
  const levelClause: estypes.QueryDslQueryContainer | undefined = f.level ? { term: { level: f.level } } : undefined

  const query: estypes.QueryDslQueryContainer = {
    function_score: {
      query: { bool: { must: f.q ? [textQuery(f.q)] : [{ match_all: {} }], filter } },
      // popularity and quality nudge ranking without ever beating a clearly better text match
      functions: [
        { field_value_factor: { field: 'students', modifier: 'log2p', factor: 0.4, missing: 0 } },
        { field_value_factor: { field: 'rating', modifier: 'sqrt', factor: 0.3, missing: 0 } },
      ],
      score_mode: 'sum',
      boost_mode: 'sum',
    },
  }
  const postFilter = [categoryClause, levelClause].filter(Boolean) as estypes.QueryDslQueryContainer[]

  const sort = f.sort && f.sort !== 'relevance' ? sorts[f.sort] : f.q ? undefined : sorts.popular
  const res = await es().search({
    index: INDEX.courses,
    from: (f.page - 1) * f.pageSize,
    size: f.pageSize,
    query,
    ...(postFilter.length ? { post_filter: { bool: { filter: postFilter } } } : {}),
    ...(sort ? { sort: [...(sort as estypes.SortCombinations[]), '_score'] } : {}),
    track_total_hits: true,
    highlight: f.q ? { pre_tags: ['<mark>'], post_tags: ['</mark>'], fields: { title: { number_of_fragments: 0 }, description: { fragment_size: 160, number_of_fragments: 1 } } } : undefined,
    aggs: {
      // each facet applies the OTHER selection, never its own
      categories: { filter: levelClause ?? { match_all: {} }, aggs: { values: { terms: { field: 'category', size: 30 } } } },
      levels: { filter: categoryClause ?? { match_all: {} }, aggs: { values: { terms: { field: 'level', size: 5 } } } },
      price: { stats: { field: 'price' } },
    },
  })

  const total = typeof res.hits.total === 'number' ? res.hits.total : res.hits.total?.value ?? 0
  const aggs = res.aggregations as unknown as {
    categories: { values: { buckets: { key: string; doc_count: number }[] } }
    levels: { values: { buckets: { key: string; doc_count: number }[] } }
    price: { min: number | null; max: number | null }
  }
  return {
    total,
    took: res.took,
    data: res.hits.hits.map((h) => ({ ...(h._source as object), score: h._score, highlight: h.highlight })),
    facets: {
      categories: aggs.categories.values.buckets.map((b) => ({ key: b.key, count: b.doc_count })),
      levels: aggs.levels.values.buckets.map((b) => ({ key: b.key, count: b.doc_count })),
      price: { min: aggs.price.min ?? 0, max: aggs.price.max ?? 0 },
    },
  }
}

export async function searchUsers(q: string | undefined, page: number, pageSize: number) {
  const res = await es().search({
    index: INDEX.users,
    from: (page - 1) * pageSize,
    size: pageSize,
    query: q ? { multi_match: { query: q, fields: ['name^4', 'name.autocomplete^2', 'skills^3', 'bio', 'location'], fuzziness: 'AUTO', prefix_length: 1 } } : { match_all: {} },
    track_total_hits: true,
  })
  return { total: typeof res.hits.total === 'number' ? res.hits.total : res.hits.total?.value ?? 0, data: res.hits.hits.map((h) => h._source) }
}

export async function searchProjects(q: string | undefined, tag: string | undefined, page: number, pageSize: number) {
  const res = await es().search({
    index: INDEX.projects,
    from: (page - 1) * pageSize,
    size: pageSize,
    query: {
      bool: {
        must: q ? [{ multi_match: { query: q, fields: ['name^4', 'name.autocomplete^2', 'tags^3', 'description^2', 'readme', 'ownerName'], fuzziness: 'AUTO', prefix_length: 1 } }] : [{ match_all: {} }],
        filter: [{ term: { visibility: 'PUBLIC' } }, ...(tag ? [{ term: { 'tags.keyword': tag.toLowerCase() } }] : [])],
      },
    },
    sort: q ? undefined : [{ stars: 'desc' }, { updatedAt: 'desc' }],
    track_total_hits: true,
  })
  return { total: typeof res.hits.total === 'number' ? res.hits.total : res.hits.total?.value ?? 0, data: res.hits.hits.map((h) => h._source) }
}

export async function autocomplete(q: string, limit: number) {
  const [courses, users, projects] = await Promise.all([
    es().search({ index: INDEX.courses, size: limit, _source: ['id', 'title', 'category'], query: { bool: { must: [{ match: { 'title.autocomplete': { query: q, operator: 'and' } } }] } } }),
    es().search({ index: INDEX.users, size: Math.ceil(limit / 2), _source: ['id', 'name', 'role'], query: { match: { 'name.autocomplete': { query: q, operator: 'and' } } } }),
    es().search({ index: INDEX.projects, size: Math.ceil(limit / 2), _source: ['id', 'name', 'slug', 'visibility'], query: { bool: { must: [{ match: { 'name.autocomplete': { query: q, operator: 'and' } } }], filter: [{ term: { visibility: 'PUBLIC' } }] } } }),
  ])
  type Src = Record<string, string | number>
  return [
    ...courses.hits.hits.map((h) => ({ type: 'course', id: (h._source as Src).id, label: (h._source as Src).title, hint: (h._source as Src).category, url: `/courses/${(h._source as Src).id}` })),
    ...users.hits.hits.map((h) => ({ type: 'instructor', id: (h._source as Src).id, label: (h._source as Src).name, hint: (h._source as Src).role, url: `/instructors/${(h._source as Src).id}` })),
    ...projects.hits.hits.map((h) => ({ type: 'project', id: (h._source as Src).id, label: (h._source as Src).name, hint: 'project', url: `/projects/${(h._source as Src).slug}` })),
  ].slice(0, limit)
}

/** "Did you mean": the closest indexed terms for each word that has no good match. */
export async function didYouMean(q: string): Promise<string[]> {
  const res = await es().search({
    index: INDEX.courses,
    size: 0,
    suggest: { text: q, simple: { term: { field: 'title', suggest_mode: 'missing', size: 3, min_word_length: 3 } } },
  })
  const parts = (res.suggest?.simple ?? []) as estypes.SearchTermSuggest[]
  const words = parts.map((p) => {
    const options = (Array.isArray(p.options) ? p.options : [p.options]) as estypes.SearchTermSuggestOption[]
    return options[0]?.text ?? p.text
  })
  const fixed = words.join(' ')
  return fixed.toLowerCase() !== q.toLowerCase() ? [fixed] : []
}

export async function similarCourses(id: number, limit: number) {
  const res = await es().search({
    index: INDEX.courses,
    size: limit,
    query: {
      bool: {
        must: [{ more_like_this: { fields: ['title', 'description', 'lessons', 'modules', 'category'], like: [{ _index: INDEX.courses, _id: String(id) }], min_term_freq: 1, min_doc_freq: 1, max_query_terms: 30 } }],
        must_not: [{ ids: { values: [String(id)] } }],
      },
    },
  })
  return res.hits.hits.map((h) => ({ ...(h._source as object), score: h._score }))
}
