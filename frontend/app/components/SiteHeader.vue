<script setup lang="ts">
const open = ref(false);
const route = useRoute();
watch(
  () => route.fullPath,
  () => {
    open.value = false;
  },
);
const links = [
  ["/kyokushin", "Киокусинкай"],
  ["/bjj", "BJJ"],
  ["/mowgli", "Маугли"],
  ["/schedule", "Расписание"],
  ["/coaches", "Тренеры"],
  ["/events", "События"],
  ["/results", "Результаты"],
  ["/pricing", "Стоимость"],
  ["/contacts", "Контакты"],
];
</script>
<template>
  <header class="site-header">
    <NuxtLink class="brand" to="/" aria-label="K-Dojo — главная"
      >K–DOJO<span>СПОРТИВНЫЙ КЛУБ · КОРОЛЁВ</span></NuxtLink
    >
    <nav class="desktop-nav" aria-label="Основная навигация">
      <details>
        <summary>Направления</summary>
        <div class="dropdown">
          <NuxtLink
            v-for="item in links.slice(0, 3)"
            :key="item[0]"
            :to="item[0]"
            >{{ item[1] }}</NuxtLink
          >
        </div>
      </details>
      <NuxtLink v-for="item in links.slice(3)" :key="item[0]" :to="item[0]">{{
        item[1]
      }}</NuxtLink>
    </nav>
    <NuxtLink class="header-cta" to="/contacts#application"
      >Бесплатная тренировка <span aria-hidden="true">↗</span></NuxtLink
    >
    <button
      class="menu-toggle"
      :aria-expanded="open"
      aria-controls="mobile-menu"
      :aria-label="open ? 'Закрыть меню' : 'Открыть меню'"
      @click="open = !open"
    >
      {{ open ? "Закрыть ×" : "Меню ☰" }}
    </button>
    <nav
      v-if="open"
      id="mobile-menu"
      class="mobile-nav"
      aria-label="Мобильная навигация"
      @keydown.esc="open = false"
    >
      <NuxtLink v-for="item in links" :key="item[0]" :to="item[0]">{{
        item[1]
      }}</NuxtLink>
    </nav>
  </header>
</template>
