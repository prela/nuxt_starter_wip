import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      // include all markdown; adjust as needed
      source: { include: '**/*.md', exclude: ['**/.!(navigation.yml)'] },
      // optional schema to future-proof types
      schema: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
      }),
    }),
  },
})
