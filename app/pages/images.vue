<script setup lang="ts">
definePageMeta({
  title: 'Images Presets Demo',
  description: 'Validate @nuxt/image presets rendering',
})

useSeoMeta({
  title: 'Images Presets Demo',
  description: 'Validate @nuxt/image presets rendering',
})
</script>

<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-4">
      Image Presets
    </h1>
    <ImagePresetDemo />
  </div>
</template>
