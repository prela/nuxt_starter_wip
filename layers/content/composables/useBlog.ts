import { useContent } from './useContent'

export function useBlog() {
  const { queryContent, getContent } = useContent()

  const getBlogPosts = async (options: { featured?: boolean, limit?: number, tag?: string } = {}) => {
    const where: Record<string, any> = {
      published: true,
      publishedAt: { $lte: new Date().toISOString() },
    }
    if (options.featured !== undefined)
      where.featured = options.featured
    if (options.tag)
      where.tags = { $contains: options.tag }

    return queryContent('blog', { where, sort: { publishedAt: -1 }, limit: options.limit })
  }

  const getBlogPost = async (slug: string) => getContent(`/blog/${slug}`)

  const getBlogTags = async () => {
    const { data: posts } = await queryContent('blog', { where: { published: true } })
    if (!posts)
      return { data: [] as string[], error: null as string | null }
    const set = new Set<string>()
      ; (posts as any[]).forEach(p => Array.isArray(p.tags) && p.tags.forEach((t: string) => set.add(t)))
    return { data: Array.from(set).sort(), error: null as string | null }
  }

  const getRelatedPosts = async (currentPost: any, limit: number = 3) => {
    if (!currentPost?.tags)
      return { data: [] as any[], error: null as string | null }
    return queryContent('blog', {
      where: { published: true, path: { $ne: currentPost.path }, tags: { $in: currentPost.tags } },
      sort: { publishedAt: -1 },
      limit,
    })
  }

  return { getBlogPosts, getBlogPost, getBlogTags, getRelatedPosts }
}
