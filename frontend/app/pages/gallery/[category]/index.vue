<script setup lang="ts">
import type { GalleryCatalog } from "~~/shared/gallery";
definePageMeta({ key: (route) => route.path });
const route = useRoute();
const { data: catalog, error } = await useFetch<GalleryCatalog>("/api/gallery");
const category = computed(() =>
  catalog.value?.categories.find((item) => item.slug === route.params.category),
);
if (!error.value && !category.value)
  throw createError({ statusCode: 404, statusMessage: "Category not found" });
usePageSeo(category.value?.title || "Галерея клуба");
const albums = computed(
  () =>
    catalog.value?.albums.filter(
      (album) => album.category === category.value?.slug,
    ) || [],
);
const visibleCount = ref(12);
</script>
<template>
  <div class="gallery-page">
    <div class="container section">
      <GalleryBreadcrumbs
        :items="[
          { title: 'Галерея', to: '/gallery' },
          { title: category?.title || 'Категория' },
        ]"
      />
      <div class="gallery-page-heading">
        <p class="eyebrow">ГАЛЕРЕЯ / K–DOJO</p>
        <h1>{{ category?.title }}</h1>
        <p class="lead">{{ category?.description }}</p>
      </div>
      <ApiState :error="error">
        <template v-if="catalog">
          <GalleryCategoryNav
            :categories="catalog.categories"
            :active="category?.slug"
          />
          <div v-if="albums.length" class="gallery-album-grid">
            <GalleryAlbumCard
              v-for="album in albums.slice(0, visibleCount)"
              :key="album.slug"
              :album="album"
            />
          </div>
          <div v-else class="gallery-empty">
            <h2>Новые истории впереди.</h2>
            <p>
              В этой категории пока нет альбомов. Загляните в другие разделы
              галереи.
            </p>
            <NuxtLink to="/gallery" class="text-link">Все категории ↗</NuxtLink>
          </div>
          <button
            v-if="visibleCount < albums.length"
            class="button gallery-more"
            type="button"
            @click="visibleCount += 12"
          >
            Ещё альбомы <span aria-hidden="true">↓</span>
          </button>
        </template>
      </ApiState>
    </div>
  </div>
</template>
