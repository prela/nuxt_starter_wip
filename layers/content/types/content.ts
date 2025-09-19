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
  category: z.string().optional(),
})

export const DocPageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().optional(),
  order: z.number().optional(),
  version: z.string().optional(),
  lastUpdated: z.string().datetime().optional(),
})

export type BlogPost = z.infer<typeof BlogPostSchema>
export type DocPage = z.infer<typeof DocPageSchema>
