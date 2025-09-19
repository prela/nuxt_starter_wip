# Content Layer

The content layer provides content management capabilities using Nuxt Content v3, enabling markdown-driven content, blog functionality, and documentation systems. It extends the core layer for validation and error handling while providing content-specific components and composables.

## Architecture

The content layer implements a content-first approach with:

- **Nuxt Content Integration**: File-based content management
- **Markdown Processing**: Enhanced markdown with Vue components
- **SEO Optimization**: Automatic meta tags and structured data
- **Content Validation**: Type-safe content schemas
- **Search Functionality**: Full-text content search

## Structure

```
layers/content/
├── components/              # Content-specific components
├── composables/             # Content management composables
├── types/                   # Content type definitions
└── nuxt.config.ts          # Content layer configuration
```

## Features

### File-Based Content Management

Content is managed through markdown files in the `content/` directory:

```
content/
├── blog/
│   ├── 2024-01-15-getting-started.md
│   ├── 2024-02-01-advanced-features.md
│   └── index.md
├── docs/
│   ├── installation.md
│   ├── configuration.md
│   └── api/
│       ├── authentication.md
│       └── endpoints.md
├── pages/
│   ├── about.md
│   ├── privacy.md
│   └── terms.md
└── index.md
```

### Content Types

#### Blog Posts

```markdown
---
title: "Getting Started with Nuxt 4"
description: "Learn how to build modern web applications with Nuxt 4"
author: "John Doe"
publishedAt: "2024-01-15"
tags: ["nuxt", "vue", "typescript"]
featured: true
image: "/blog/getting-started-hero.jpg"
---

# Getting Started with Nuxt 4

This is the introduction to your blog post...

## Section 1

Content with **bold** and *italic* text.

```typescript
// Code example
const app = createApp({
  // Your app configuration
})
```

## Usage

### Content Querying (v3)

```vue
<script setup lang="ts">
const route = useRoute()

// List blog posts from the "content" collection
const posts = await queryCollection('content')
  .where('path', 'LIKE', '/blog%')
  .limit(20)
  .all()

// Load a single page by current route
const page = await queryCollection('content')
  .path(route.path)
  .first()
</script>

<template>
  <div>
    <!-- Display blog posts -->
    <div v-for="post in posts" :key="post.path">
      <h2>{{ post.title }}</h2>
      <p>{{ post.description }}</p>
      <NuxtLink :to="post.path">
        Read more
      </NuxtLink>
    </div>

    <!-- Display single article -->
    <ContentRenderer v-if="page" :value="page" />
  </div>
</template>
```

### Content Components

Note: The following components are examples. Create them under `layers/content/components` when implementing.

#### BlogCard Component

```vue
<script setup lang="ts">
interface BlogPost {
  _path: string
  title: string
  description: string
  author?: string
  publishedAt: string
  tags?: string[]
  image?: string
  featured?: boolean
}

interface Props {
  post: BlogPost
}

defineProps<Props>()

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <article class="blog-card">
    <NuxtImg
      v-if="post.image"
      :src="post.image"
      :alt="post.title"
      class="blog-card-image"
    />

    <div class="blog-card-content">
      <div class="blog-card-meta">
        <time :datetime="post.publishedAt">
          {{ formatDate(post.publishedAt) }}
        </time>
        <span v-if="post.author">by {{ post.author }}</span>
      </div>

      <h3 class="blog-card-title">
        <NuxtLink :to="post.path">
          {{ post.title }}
        </NuxtLink>
      </h3>

      <p class="blog-card-description">
        {{ post.description }}
      </p>

      <div v-if="post.tags" class="blog-card-tags">
        <span
          v-for="tag in post.tags"
          :key="tag"
          class="tag"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </article>
</template>
```

#### TableOfContents Component

```vue
<script setup lang="ts">
interface TocLink {
  id: string
  text: string
  depth: number
}

interface Props {
  toc: TocLink[]
}

defineProps<Props>()

const activeId = ref<string>('')

// Track active heading on scroll
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activeId.value = entry.target.id
      }
    })
  }, {
    rootMargin: '-100px 0px -80% 0px'
  })

  // Observe all headings
  document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    observer.observe(heading)
  })

  onUnmounted(() => {
    observer.disconnect()
  })
})

function scrollToHeading(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: 'smooth'
  })
}
</script>

<template>
  <nav class="table-of-contents">
    <h4>Table of Contents</h4>
    <ul>
      <li
        v-for="link in toc"
        :key="link.id"
        :class="`toc-level-${link.depth}`"
      >
        <a
          :href="`#${link.id}`"
          :class="{ active: activeId === link.id }"
          @click="scrollToHeading(link.id)"
        >
          {{ link.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>
```

### Content Composables

#### useContent()

```typescript
// composables/useContent.ts
export function useContent() {
  /**
   * Query content with caching and error handling
   */
  const queryContent = async <T = any>(
    path?: string,
    options: {
      where?: Record<string, any>
      sort?: Record<string, 1 | -1>
      limit?: number
      skip?: number
    } = {}
  ) => {
    try {
      let query = $fetch('/api/_content/query')

      if (path) {
        query = query.where({ _path: { $regex: `^${path}` } })
      }

      if (options.where) {
        query = query.where(options.where)
      }

      if (options.sort) {
        query = query.sort(options.sort)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.skip) {
        query = query.skip(options.skip)
      }

      const results = await query.find()
      return { data: results as T[], error: null }
    }
    catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Content query failed'
      }
    }
  }

  /**
   * Get single content item
   */
  const getContent = async <T = any>(path: string) => {
    try {
      const content = await $fetch(`/api/_content/query`)
        .where({ _path: path })
        .findOne()

      return { data: content as T, error: null }
    }
    catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Content not found'
      }
    }
  }

  /**
   * Search content
   */
  const searchContent = async (query: string, options: {
    limit?: number
    where?: Record<string, any>
  } = {}) => {
    try {
      const results = await $fetch('/api/_content/query')
        .where({
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { body: { $regex: query, $options: 'i' } }
          ],
          ...options.where
        })
        .limit(options.limit || 10)
        .find()

      return { data: results, error: null }
    }
    catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Search failed'
      }
    }
  }

  return {
    queryContent,
    getContent,
    searchContent
  }
}
```

#### useBlog()

```typescript
// composables/useBlog.ts
export function useBlog() {
  const { queryContent, getContent } = useContent()

  /**
   * Get published blog posts
   */
  const getBlogPosts = async (options: {
    featured?: boolean
    limit?: number
    tag?: string
  } = {}) => {
    const where: Record<string, any> = {
      published: true,
      publishedAt: { $lte: new Date().toISOString() }
    }

    if (options.featured !== undefined) {
      where.featured = options.featured
    }

    if (options.tag) {
      where.tags = { $contains: options.tag }
    }

    return queryContent('blog', {
      where,
      sort: { publishedAt: -1 },
      limit: options.limit
    })
  }

  /**
   * Get blog post by slug
   */
  const getBlogPost = async (slug: string) => {
    return getContent(`/blog/${slug}`)
  }

  /**
   * Get all blog tags
   */
  const getBlogTags = async () => {
    const { data: posts } = await queryContent('blog', {
      where: { published: true }
    })

    if (!posts)
      return { data: [], error: null }

    const tagsSet = new Set<string>()
    posts.forEach((post: any) => {
      if (post.tags) {
        post.tags.forEach((tag: string) => tagsSet.add(tag))
      }
    })

    return { data: Array.from(tagsSet).sort(), error: null }
  }

  /**
   * Get related blog posts
   */
  const getRelatedPosts = async (currentPost: any, limit: number = 3) => {
    if (!currentPost.tags) {
      return { data: [], error: null }
    }

    return queryContent('blog', {
      where: {
        published: true,
        _path: { $ne: currentPost._path },
        tags: { $in: currentPost.tags }
      },
      sort: { publishedAt: -1 },
      limit
    })
  }

  return {
    getBlogPosts,
    getBlogPost,
    getBlogTags,
    getRelatedPosts
  }
}
```

### Content Validation

#### Content Schemas

```typescript
// types/content.ts (create this file to implement)
import { z } from 'zod'

export const BlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  author: z.string().optional(),
  publishedAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  image: z.string().url().optional(),
  imageAlt: z.string().optional(),
  readingTime: z.number().optional(),
  category: z.string().optional()
})

export const DocPageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().optional(),
  order: z.number().optional(),
  version: z.string().optional(),
  lastUpdated: z.string().datetime().optional()
})

export type BlogPost = z.infer<typeof BlogPostSchema>
export type DocPage = z.infer<typeof DocPageSchema>
```

### SEO Integration

#### Automatic Meta Tags

```vue
<script setup lang="ts">
const route = useRoute()
const page = await queryCollection('content').path(route.path).first()

if (!page) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

useSeoMeta({
  title: page.title,
  description: page.description,
  ogTitle: page.title,
  ogDescription: page.description,
  ogImage: page.image || '/default-og-image.jpg',
  ogType: page.path.startsWith('/blog') ? 'article' : 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: page.title,
  twitterDescription: page.description,
  twitterImage: page.image || '/default-og-image.jpg'
})
</script>

<template>
  <ContentRenderer :value="page" />
</template>
```

### Content Search

#### Search Implementation

```vue
<script setup lang="ts">
const { searchContent } = useContent()

const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)

const handleSearch = useDebounceFn(async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  isSearching.value = true

  try {
    const { data, error } = await searchContent(searchQuery.value, {
      limit: 20
    })

    if (error) {
      console.error('Search error:', error)
      return
    }

    searchResults.value = data || []
  }
  finally {
    isSearching.value = false
  }
}, 300)

function formatPath(path: string) {
  return path.replace(/^\//, '').replace(/\//g, ' › ')
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}
</script>

<template>
  <div class="content-search">
    <UInput
      v-model="searchQuery"
      placeholder="Search content..."
      icon="i-lucide-search"
      @input="handleSearch"
    />

    <div v-if="isSearching" class="search-loading">
      Searching...
    </div>

    <div v-else-if="searchResults.length > 0" class="search-results">
      <h3>Search Results ({{ searchResults.length }})</h3>
      <div
        v-for="result in searchResults"
        :key="result._path"
        class="search-result"
      >
        <h4>
          <NuxtLink :to="result._path">
            {{ result.title }}
          </NuxtLink>
        </h4>
        <p>{{ result.description }}</p>
        <div class="search-meta">
          <span>{{ formatPath(result._path) }}</span>
          <time v-if="result.publishedAt">
            {{ formatDate(result.publishedAt) }}
          </time>
        </div>
      </div>
    </div>

    <div v-else-if="searchQuery && !isSearching" class="no-results">
      No results found for "{{ searchQuery }}"
    </div>
  </div>
</template>
```

## Pages and Layouts

### Blog Layout

```vue
<!-- layouts/blog.vue -->
<template>
  <div class="blog-layout">
    <header class="blog-header">
      <NuxtLink to="/blog" class="blog-title">
        <h1>Blog</h1>
      </NuxtLink>

      <nav class="blog-nav">
        <NuxtLink to="/blog">
          All Posts
        </NuxtLink>
        <NuxtLink to="/blog/featured">
          Featured
        </NuxtLink>
        <NuxtLink to="/blog/tags">
          Tags
        </NuxtLink>
      </nav>
    </header>

    <main class="blog-main">
      <slot />
    </main>

    <aside class="blog-sidebar">
      <BlogSearchWidget />
      <BlogTagsWidget />
      <BlogRecentPostsWidget />
    </aside>
  </div>
</template>
```

### Content Pages

```vue
<!-- pages/blog/[...slug].vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'blog'
})

const route = useRoute()
const { getBlogPost, getRelatedPosts } = useBlog()

// Get blog post
const { data, error } = await getBlogPost(route.params.slug as string)

if (error || !data) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Blog post not found'
  })
}

// Get related posts
const { data: relatedPosts } = await getRelatedPosts(data, 3)

// Calculate reading time
if (data.body) {
  const wordCount = data.body.children
    .map((node: any) => extractTextFromNode(node))
    .join(' ')
    .split(' ')
    .length

  data.readingTime = Math.ceil(wordCount / 200) // 200 WPM average
}

function extractTextFromNode(node: any): string {
  if (node.type === 'text') {
    return node.value
  }
  if (node.children) {
    return node.children.map(extractTextFromNode).join(' ')
  }
  return ''
}
</script>

<template>
  <div>
    <BlogPostHeader
      :title="data.title"
      :description="data.description"
      :author="data.author"
      :published-at="data.publishedAt"
      :tags="data.tags"
      :reading-time="data.readingTime"
    />

    <div class="content-wrapper">
      <aside class="content-toc">
        <TableOfContents :toc="data.body.toc" />
      </aside>

      <article class="content-article">
        <ContentRenderer :value="data" />
      </article>
    </div>

    <BlogPostFooter
      :tags="data.tags"
      :related-posts="relatedPosts"
    />
  </div>
</template>
```

## Performance

### Image Optimization

```vue
<template>
  <!-- Optimized images in content -->
  <NuxtImg
    :src="post.image"
    :alt="post.imageAlt || post.title"
    :width="800"
    :height="400"
    format="webp"
    loading="lazy"
    class="blog-post-image"
  />
</template>
```

### Content Caching

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  content: {
    // Enable content caching
    experimental: {
      clientDB: true
    },
    // Optimize content queries
    ignores: [
      'node_modules',
      '.git'
    ]
  },

  nitro: {
    // Cache content API routes
    routeRules: {
      '/api/_content/**': {
        headers: { 'Cache-Control': 's-maxage=300' }
      }
    }
  }
})
```

## Integration

### With Other Layers

The content layer integrates with:

- **Core Layer**: Uses validation schemas and error handling
- **UI Layer**: Leverages design system components
- **API Layer**: Can fetch additional data for content pages

### CMS Integration

```typescript
// composables/useCMS.ts (create this file to implement)
export function useCMS() {
  const api = useApi()

  const syncContent = async () => {
    // Sync with external CMS
    const { data, error } = await api.get('/api/cms/sync')

    if (error) {
      throw new Error('Failed to sync content')
    }

    return data
  }

  return { syncContent }
}
```

## Testing

### Content Testing

```typescript
import { $fetch } from '@nuxt/test-utils'
// tests/content/blog.test.ts
import { describe, expect, it } from 'vitest'

describe('Blog Content', () => {
  it('fetches blog posts', async () => {
    const posts = await $fetch('/api/_content/query?where={"_path":{"$regex":"^/blog"},"published":true}')

    expect(Array.isArray(posts)).toBe(true)
    posts.forEach((post) => {
      expect(post).toHaveProperty('title')
      expect(post).toHaveProperty('description')
      expect(post).toHaveProperty('_path')
    })
  })

  it('validates blog post schema', () => {
    const validPost = {
      title: 'Test Post',
      description: 'Test description',
      publishedAt: new Date().toISOString(),
      published: true
    }

    const result = BlogPostSchema.safeParse(validPost)
    expect(result.success).toBe(true)
  })
})
```
