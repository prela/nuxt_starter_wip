<!--
  Demo component to showcase @nuxt/image presets
  Demonstrates different preset configurations for various use cases
-->
<script setup lang="ts">
// Component setup - no additional logic needed for image preset demo
</script>

<template>
  <div class="space-y-8">
    <h2 class="text-2xl font-bold mb-4">
      @nuxt/image Preset Examples
    </h2>

    <!-- Avatar preset demo -->
    <div class="bg-gray-50 p-4 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">
        Avatar Preset (150x150, webp, quality 85)
      </h3>
      <div class="flex items-center space-x-4">
        <NuxtImg
          preset="avatar"
          src="/icon-green.png"
          alt="Avatar example"
          class="rounded-full"
        />
        <code class="text-sm bg-gray-200 px-2 py-1 rounded">
          &lt;NuxtImg preset="avatar" src="/icon-green.png" /&gt;
        </code>
      </div>
    </div>

    <!-- Thumbnail preset demo -->
    <div class="bg-gray-50 p-4 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">
        Thumbnail Preset (300x200, webp, quality 75)
      </h3>
      <div class="space-y-2">
        <NuxtImg
          preset="thumbnail"
          src="/icon-green.png"
          alt="Thumbnail example"
          class="rounded-lg"
        />
        <code class="text-sm bg-gray-200 px-2 py-1 rounded block">
          &lt;NuxtImg preset="thumbnail" src="/icon-green.png" /&gt;
        </code>
      </div>
    </div>

    <!-- Card preset demo -->
    <div class="bg-gray-50 p-4 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">
        Card Preset (400x250, webp, quality 80)
      </h3>
      <div class="space-y-2">
        <NuxtImg
          preset="card"
          src="/icon-green.png"
          alt="Card example"
          class="rounded-lg"
        />
        <code class="text-sm bg-gray-200 px-2 py-1 rounded block">
          &lt;NuxtImg preset="card" src="/icon-green.png" /&gt;
        </code>
      </div>
    </div>

    <!-- Default preset demo -->
    <div class="bg-gray-50 p-4 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">
        Default Preset (webp, quality 80, fit cover)
      </h3>
      <div class="space-y-2">
        <NuxtImg
          preset="default"
          src="/icon-green.png"
          alt="Default preset example"
          width="200"
          height="200"
          class="rounded-lg"
        />
        <code class="text-sm bg-gray-200 px-2 py-1 rounded block">
          &lt;NuxtImg preset="default" width="200" height="200" /&gt;
        </code>
      </div>
    </div>

    <!-- Responsive image with sizes -->
    <div class="bg-gray-50 p-4 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">
        Responsive Image with Sizes
      </h3>
      <div class="space-y-2">
        <NuxtPicture
          src="/icon-green.png"
          alt="Responsive example"
          sizes="sm:300px md:400px lg:500px"
          class="rounded-lg w-full max-w-md"
        />
        <code class="text-sm bg-gray-200 px-2 py-1 rounded block">
          &lt;NuxtPicture sizes="sm:300px md:400px lg:500px" /&gt;
        </code>
      </div>
    </div>
  </div>
</template>
