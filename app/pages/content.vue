<!--
  Content page to test content route caching
  This page will be cached using routeRules with swr: 300
-->
<script setup lang="ts">
// Define page metadata
definePageMeta({
  title: 'Content Page',
  description: 'Test page for content route caching with routeRules',
})

// Add head metadata
useSeoMeta({
  title: 'Content Page - Cache Test',
  description: 'Testing content route caching with Nitro routeRules',
})
</script>

<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-4">
      Content Page
    </h1>
    <p class="text-gray-600 mb-4">
      This page is served with SWR caching (300 seconds) configured via routeRules.
    </p>
    <div class="bg-blue-50 p-4 rounded-lg mb-8">
      <h2 class="text-xl font-semibold mb-2">
        Cache Information
      </h2>
      <p class="text-sm text-gray-700">
        This page uses stale-while-revalidate caching with a 5-minute cache duration.
        Check the cache-control headers to verify the configuration.
      </p>
    </div>

    <!-- Image preset demonstration -->
    <ImagePresetDemo />
  </div>
</template>
