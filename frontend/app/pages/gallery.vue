<script setup lang="ts">
import type { Album } from "~/types/api";
usePageSeo("Фотографии клуба");
const { data: albums, error } = await useClubApi<Album[]>("gallery");
const category = ref("");
const categories = [
  ["", "Все"],
  ["kyokushin", "Киокусинкай"],
  ["bjj", "BJJ"],
  ["mowgli", "Маугли"],
  ["competitions", "Соревнования"],
  ["camps", "Сборы"],
  ["exams", "Экзамены"],
  ["club", "Клуб"],
];
const filtered = computed(
  () =>
    albums.value?.filter(
      (a) => !category.value || a.category === category.value,
    ) || [],
);
</script>
<template>
  <div class="container">
    <div class="page-heading">
      <p class="eyebrow">В КАДРЕ — K-DOJO</p>
      <h1>Жизнь клуба</h1>
      <p class="lead">Тренировки, детали, люди и моменты между стартами.</p>
    </div>
    <section class="section">
      <div class="tabs">
        <button
          v-for="c in categories"
          :key="c[0]"
          :aria-pressed="category === c[0]"
          @click="category = c[0] || ''"
        >
          {{ c[1] }}
        </button>
      </div>
      <ApiState :error="error"
        ><template v-if="filtered.length"
          ><section v-for="album in filtered" :key="album.id" class="section">
            <h2>{{ album.title }}</h2>
            <GalleryGrid :images="album.images" /></section></template
        ><EmptyState
          v-else
          title="Настоящие фотографии — скоро"
          text="Готовим фотографии тренировок, сборов и клубных встреч. Здесь будут только материалы K-Dojo."
      /></ApiState>
    </section>
  </div>
</template>
