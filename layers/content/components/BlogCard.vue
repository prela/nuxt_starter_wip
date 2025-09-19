<script setup lang="ts">
interface BlogPost {
  _path: string
  title: string
  description: string
  author?: string
  publishedAt: string
  tags?: string[]
  image?: string
}

interface Props { post: BlogPost }
defineProps<Props>()

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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
        <time :datetime="post.publishedAt">{{ formatDate(post.publishedAt) }}</time>
        <span v-if="post.author">by {{ post.author }}</span>
      </div>

      <h3 class="blog-card-title">
        <NuxtLink :to="post._path">
          {{ post.title }}
        </NuxtLink>
      </h3>

      <p class="blog-card-description">
        {{ post.description }}
      </p>

      <div v-if="post.tags" class="blog-card-tags">
        <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </div>
  </article>
</template>
