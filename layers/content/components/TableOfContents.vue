<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

interface TocLink { id: string, text: string, depth: number }
defineProps<{ toc: TocLink[] }>()

const activeId = ref<string>('')

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting)
        activeId.value = (entry.target as HTMLElement).id
    })
  }, { rootMargin: '-100px 0px -80% 0px' })

  document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    observer.observe(heading)
  })

  onUnmounted(() => observer.disconnect())
})

function scrollToHeading(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <nav class="table-of-contents">
    <h4>Table of Contents</h4>
    <ul>
      <li v-for="link in toc" :key="link.id" :class="`toc-level-${link.depth}`">
        <a :href="`#${link.id}`" :class="{ active: activeId === link.id }" @click="scrollToHeading(link.id)">
          {{ link.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>
