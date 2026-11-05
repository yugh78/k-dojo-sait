<script setup lang="ts">
import type {
  GalleryAlbum,
  GalleryCatalog,
  GalleryPhotoPage,
} from "~~/shared/gallery";
import { galleryDate } from "~/utils/gallery";
definePageMeta({ key: (route) => route.path });
const route = useRoute();
const slug = String(route.params.album);
const { data, error } = await useFetch<{
  album: GalleryAlbum;
  photos: GalleryPhotoPage;
}>(`/api/gallery/albums/${encodeURIComponent(slug)}`);
if (
  error.value?.statusCode === 404 ||
  (data.value && data.value.album.category !== route.params.category)
)
  throw createError({ statusCode: 404, statusMessage: "Album not found" });
const { data: catalog } = await useFetch<GalleryCatalog>("/api/gallery");
const album = computed(() => data.value?.album);
usePageSeo(album.value?.title || "Галерея клуба");
const images = ref(data.value?.photos.items || []);
const nextPage = ref(1);
const loading = ref(false);
const loadError = ref(false);
async function loadMore() {
  if (loading.value) return;
  loading.value = true;
  loadError.value = false;
  try {
    const page = await $fetch<GalleryPhotoPage>(
      `/api/gallery/albums/${encodeURIComponent(slug)}/photos`,
      { query: { page: nextPage.value } },
    );
    images.value.push(...page.items);
    nextPage.value++;
  } catch {
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}
</script>
<template>
  <div class="gallery-page">
    <div class="container section">
      <GalleryBreadcrumbs
        :items="[
          { title: 'Галерея', to: '/gallery' },
          {
            title: album?.categoryTitle || 'Категория',
            to: `/gallery/${route.params.category}`,
          },
          { title: album?.title || 'Альбом' },
        ]"
      />
      <div class="gallery-page-heading">
        <p class="eyebrow">{{ album?.categoryTitle }}</p>
        <h1>{{ album?.title }}</h1>
        <div class="gallery-album-meta">
          <time v-if="album?.date" :datetime="album.date">{{
            galleryDate(album.date)
          }}</time
          ><span>{{ album?.photoCount }} фото</span>
        </div>
        <p class="lead">{{ album?.description }}</p>
      </div>
      <GalleryCategoryNav
        v-if="catalog"
        :categories="catalog.categories"
        :active="album?.category"
      />
      <ApiState :error="error">
        <GalleryGrid v-if="images.length" :images="images" />
        <p v-else class="gallery-empty">Фотографии скоро появятся.</p>
        <p v-if="loadError" role="alert">
          Не удалось загрузить фотографии. Нажмите кнопку ещё раз.
        </p>
        <button
          v-if="images.length < (album?.photoCount || 0)"
          type="button"
          class="button gallery-more"
          :disabled="loading"
          @click="loadMore"
        >
          {{
            loading
              ? "Загружаем…"
              : loadError
                ? "Повторить загрузку"
                : "Ещё фотографии"
          }}
          <span aria-hidden="true">↓</span>
        </button>
        <p v-if="images.length" class="gallery-progress" aria-live="polite">
          Показано {{ images.length }} из {{ album?.photoCount }}
        </p>
      </ApiState>
    </div>
  </div>
</template>
