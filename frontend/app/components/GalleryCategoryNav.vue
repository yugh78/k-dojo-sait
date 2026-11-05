<script setup lang="ts">
import type { GalleryCategory } from "~~/shared/gallery";
defineProps<{ categories: GalleryCategory[]; active?: string }>();
</script>
<template>
  <nav class="gallery-category-nav" aria-label="Категории галереи">
    <NuxtLink to="/gallery" :aria-current="!active ? 'page' : undefined"
      >Все категории</NuxtLink
    >
    <NuxtLink
      v-for="category in categories"
      :key="category.slug"
      :to="`/gallery/${category.slug}`"
      :aria-current="active === category.slug ? 'page' : undefined"
      >{{ category.title }}</NuxtLink
    >
  </nav>
</template>
