<script setup lang="ts">
import type { GalleryImage } from "~/types/api";

const { data: images } = await useFetch<GalleryImage[]>(
  "/api/gallery/featured",
  { default: () => [] },
);
</script>

<template>
  <section v-if="images.length" id="gallery" class="home-gallery">
    <div class="container section">
      <SectionHeader
        number="06"
        eyebrow="ЖИЗНЬ КЛУБА"
        title="В движении. В моменте."
        to="/gallery"
        link-text="Смотреть всю галерею"
      />
      <p class="gallery-intro">
        Работа над техникой, поддержка партнёра и маленькие победы. Загляните на
        нашу тренировку.
      </p>
      <GalleryGrid :images="images" />
      <div class="gallery-footnote">
        <span>K–DOJO / КОРОЛЁВ</span>
        <span
          >Нажмите на кадр, чтобы рассмотреть ближе
          <span aria-hidden="true">↗</span></span
        >
      </div>
    </div>
  </section>
</template>
