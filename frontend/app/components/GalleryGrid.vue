<script setup lang="ts">
import type { GalleryImage } from "~/types/api";
defineProps<{ images: GalleryImage[] }>();
const current = ref<GalleryImage>();
const dialog = ref<HTMLDialogElement>();
async function show(image: GalleryImage) {
  current.value = image;
  await nextTick();
  dialog.value?.showModal();
}
</script>
<template>
  <div class="gallery-grid">
    <button
      v-for="image in images"
      :key="image.id"
      :aria-label="'Открыть: ' + image.caption"
      @click="show(image)"
    >
      <figure>
        <ResponsiveImage
          :src="image.image"
          :webp="image.image_webp"
          :avif="image.image_avif"
          :alt="image.caption"
        />
        <figcaption>{{ image.caption }}</figcaption>
      </figure>
    </button>
  </div>
  <dialog ref="dialog" class="lightbox" aria-label="Просмотр фотографии">
    <button autofocus @click="dialog?.close()">Закрыть ×</button
    ><img v-if="current" :src="current.image" :alt="current.caption" />
    <p>{{ current?.caption }}</p>
  </dialog>
</template>
