/**
 * Turns a sentence like "beginner javascript courses under $20" into structured filters plus the
 * words that should be searched. Rule based and predictable: it recognises levels, price phrases,
 * "free", rating phrases and any known category name; everything else stays as the text query.
 */
export interface ParsedQuery {
  text: string
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  minPrice?: number
  maxPrice?: number
  free?: boolean
  minRating?: number
  category?: string
  sort?: 'rating' | 'popular' | 'newest' | 'price_asc'
  interpreted: string[]
}

const LEVELS: [RegExp, ParsedQuery['level']][] = [
  [/\b(beginners?|newbie|starter|intro(?:duction)?|basics?|easy)\b/gi, 'BEGINNER'],
  [/\b(intermediate|mid[- ]level)\b/gi, 'INTERMEDIATE'],
  [/\b(advanced|expert|pro|in[- ]depth)\b/gi, 'ADVANCED'],
]

export function parseNaturalQuery(input: string, knownCategories: string[] = []): ParsedQuery {
  let text = ` ${input} `
  const out: ParsedQuery = { text: '', interpreted: [] }
  const take = (re: RegExp, fn: (m: RegExpMatchArray) => void) => {
    const m = text.match(re)
    if (m) { fn(m); text = text.replace(re, ' ') }
  }

  for (const [re, level] of LEVELS) {
    if (re.test(text)) { out.level = level; out.interpreted.push(`level ${level!.toLowerCase()}`); text = text.replace(re, ' ') }
    re.lastIndex = 0
  }
  take(/\b(free|no cost|zero cost)\b/i, () => { out.free = true; out.interpreted.push('free') })
  take(/\b(?:under|below|less than|cheaper than|max(?:imum)?|up to|<)\s*\$?\s*(\d+(?:\.\d+)?)/i, (m) => { out.maxPrice = Number(m[1]); out.interpreted.push(`price up to $${m[1]}`) })
  take(/\b(?:over|above|more than|at least|min(?:imum)?|>)\s*\$\s*(\d+(?:\.\d+)?)/i, (m) => { out.minPrice = Number(m[1]); out.interpreted.push(`price from $${m[1]}`) })
  take(/\b(?:between)\s*\$?\s*(\d+)\s*(?:and|-|to)\s*\$?\s*(\d+)/i, (m) => { out.minPrice = Number(m[1]); out.maxPrice = Number(m[2]); out.interpreted.push(`price $${m[1]}-$${m[2]}`) })
  take(/\b(?:rated|rating)\s*(?:above|over|at least|>=?)?\s*(\d(?:\.\d)?)\s*\+?(?:\s*stars?)?/i, (m) => { out.minRating = Number(m[1]); out.interpreted.push(`rating ${m[1]}+`) })
  take(/\b(top[- ]rated|best(?:[- ]rated)?|highest rated)\b/i, () => { out.sort = 'rating'; out.interpreted.push('best rated first') })
  take(/\b(most popular|popular|trending)\b/i, () => { out.sort = 'popular'; out.interpreted.push('most popular first') })
  take(/\b(newest|latest|recent|new)\b/i, () => { out.sort = 'newest'; out.interpreted.push('newest first') })
  take(/\b(cheapest|lowest price)\b/i, () => { out.sort = 'price_asc'; out.interpreted.push('cheapest first') })

  for (const c of knownCategories) {
    const re = new RegExp(`\\b${c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    if (re.test(text)) { out.category = c; out.interpreted.push(`category ${c}`); text = text.replace(re, ' '); break }
  }

  // filler words that add nothing to the match
  text = text.replace(/\b(courses?|classes|tutorials?|lessons?|learn(?:ing)?|show me|find|me|i want|looking for|for|a|an|the|with|about|on|in)\b/gi, ' ')
  out.text = text.replace(/[$<>]/g, ' ').replace(/\s+/g, ' ').trim()
  return out
}
