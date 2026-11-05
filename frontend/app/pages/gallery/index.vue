<script setup lang="ts">
import type { GalleryCatalog } from "~~/shared/gallery";
usePageSeo("Галерея клуба");
const { data: catalog, error } = await useFetch<GalleryCatalog>("/api/gallery");
</script>
<template>
  <div class="gallery-page">
    <div class="container section">
      <GalleryBreadcrumbs :items="[{ title: 'Галерея' }]" />
      <div class="gallery-page-heading">
        <p class="eyebrow">В КАДРЕ — K–DOJO</p>
        <h1>Жизнь клуба.<br />В каждом кадре.</h1>
        <p class="lead">
          Тренировки, соревнования и моменты, которые делают нас командой.
          Выберите свою историю.
        </p>
      </div>
      <ApiState :error="error">
        <template v-if="catalog">
          <GalleryCategoryNav :categories="catalog.categories" />
          <div class="gallery-category-grid">
            <NuxtLink
              v-for="(category, index) in catalog.categories"
              :key="category.slug"
              :to="`/gallery/${category.slug}`"
              class="gallery-tile gallery-category-card"
              :style="{
                '--gallery-position': category.cover?.position || 'center',
              }"
            >
              <figure>
                <ResponsiveImage
                  v-if="category.cover"
                  :src="category.cover.image"
                  :srcset="category.cover.srcset"
                  :width="category.cover.width"
                  :height="category.cover.height"
                  sizes="(max-width: 600px) 90vw, 50vw"
                  :alt="category.title"
                />
                <span
                  v-else
                  class="gallery-category-placeholder"
                  aria-hidden="true"
                  >{{ String(index + 1).padStart(2, "0") }}</span
                >
                <figcaption>
                  <span
                    ><small>{{
                      category.albumCount
                        ? `Альбомов: ${category.albumCount}`
                        : "Новые истории впереди"
                    }}</small
                    >{{ category.title }}</span
                  ><span class="gallery-expand" aria-hidden="true">↗</span>
                </figcaption>
              </figure>
            </NuxtLink>
          </div>
          <section v-if="catalog.albums.length" class="gallery-recent">
            <SectionHeader
              eyebrow="ИСТОРИИ В ФОТОГРАФИЯХ"
              title="Последние альбомы"
            />
            <div class="gallery-album-grid">
              <GalleryAlbumCard
                v-for="album in catalog.albums.slice(0, 6)"
                :key="album.slug"
                :album="album"
              />
            </div>
          </section>
        </template>
      </ApiState>
    </div>
  </div>
</template>
