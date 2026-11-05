<script setup lang="ts">
import type { GalleryAlbum } from "~~/shared/gallery";
import { galleryDate } from "~/utils/gallery";
defineProps<{ album: GalleryAlbum }>();
</script>
<template>
  <article class="gallery-album-card">
    <NuxtLink
      :to="album.url"
      class="gallery-tile"
      :aria-label="`Открыть альбом: ${album.title}`"
      :style="{ '--gallery-position': album.cover?.position || 'center' }"
    >
      <figure>
        <ResponsiveImage
          :src="album.cover?.image"
          :srcset="album.cover?.srcset"
          :width="album.cover?.width"
          :height="album.cover?.height"
          sizes="(max-width: 600px) 90vw, 45vw"
          :alt="album.title"
        />
        <figcaption>
          <span
            ><small>{{ album.categoryTitle }}</small
            >{{ album.title }}</span
          ><span class="gallery-expand" aria-hidden="true">↗</span>
        </figcaption>
      </figure>
    </NuxtLink>
    <div class="gallery-album-meta">
      <time v-if="album.date" :datetime="album.date">{{
        galleryDate(album.date)
      }}</time
      ><span>{{ album.photoCount }} фото</span>
    </div>
    <p>{{ album.description }}</p>
  </article>
</template>
