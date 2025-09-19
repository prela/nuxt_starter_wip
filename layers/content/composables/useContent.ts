import { queryCollection } from '#imports'

export function useContent() {
  const queryContentList = async <T = any>(path?: string, opts: {
    where?: Record<string, any>
    sort?: Record<string, 1 | -1>
    limit?: number
    skip?: number
  } = {}) => {
    try {
      // Nuxt Content v3 uses collection-based queries
      let q = queryCollection('content')
      if (path)
        q = q.where('path', 'LIKE', `/${path}%`)
      // Optional additional where clauses are not directly portable; apply server-side basic filters only
      if (opts.limit)
        q = q.limit(opts.limit)
      // offset not supported across all drivers; omit for portability
      const results = await q.all()
      return { data: results as T[], error: null as string | null }
    }
    catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Content query failed' }
    }
  }

  const getContentItem = async <T = any>(path: string) => {
    try {
      const res = await queryCollection('content')
        .path(path)
        .first()
      return { data: res as T, error: null as string | null }
    }
    catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Content not found' }
    }
  }

  const searchContent = async (query: string, options: { limit?: number, where?: Record<string, any> } = {}) => {
    try {
      // Simple title/description LIKE search; for full-text use queryCollectionSearchSections
      let q = queryCollection('content')
        .where('title', 'LIKE', `%${query}%`)
      if (options.limit)
        q = q.limit(options.limit)
      const results = await q.all()
      return { data: results, error: null as string | null }
    }
    catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Search failed' }
    }
  }

  return { queryContent: queryContentList, getContent: getContentItem, searchContent }
}
