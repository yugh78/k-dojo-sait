<script setup lang="ts">
const open = ref(false);
const directions = ref<HTMLDetailsElement | null>(null);
function onDirectionsPointerEnter(event: PointerEvent) {
  if (event.pointerType === "mouse" && directions.value) {
    directions.value.open = true;
  }
}
function onDirectionsPointerLeave(event: PointerEvent) {
  if (event.pointerType === "mouse") closeDirections();
}
function closeDirections() {
  if (directions.value) directions.value.open = false;
}
function onOutsidePointer(event: PointerEvent) {
  if (
    event.target instanceof Node &&
    !directions.value?.contains(event.target)
  ) {
    closeDirections();
  }
}
function onEscape(event: KeyboardEvent) {
  if (event.key !== "Escape" || !directions.value?.open) return;
  if (directions.value.contains(document.activeElement)) {
    directions.value.querySelector("summary")?.focus();
  }
  closeDirections();
}
function onDirectionsFocusOut(event: FocusEvent) {
  if (
    !(event.relatedTarget instanceof Node) ||
    !directions.value?.contains(event.relatedTarget)
  ) {
    closeDirections();
  }
}
onMounted(() => {
  document.addEventListener("pointerdown", onOutsidePointer);
  document.addEventListener("keydown", onEscape);
});
onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onOutsidePointer);
  document.removeEventListener("keydown", onEscape);
});
const route = useRoute();
watch(
  () => route.fullPath,
  () => {
    open.value = false;
    closeDirections();
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
    <NuxtLink class="brand" to="/" aria-label="K-Dojo — главная">
      <img src="/brand/k-dojo.svg" alt="" width="60" height="60" />
      <span class="brand-wordmark"
        >K–DOJO<small>КЛУБ ЕДИНОБОРСТВ · КОРОЛЁВ</small></span
      >
    </NuxtLink>
    <nav class="desktop-nav" aria-label="Основная навигация">
      <details
        ref="directions"
        @pointerenter="onDirectionsPointerEnter"
        @pointerleave="onDirectionsPointerLeave"
        @focusout="onDirectionsFocusOut"
      >
        <summary>Направления</summary>
        <div class="dropdown">
          <NuxtLink
            v-for="item in links.slice(0, 3)"
            :key="item[0]"
            :to="item[0]"
            @click="closeDirections"
            >{{ item[1] }}</NuxtLink
          >
        </div>
      </details>
      <NuxtLink
        v-for="item in links.filter((item) =>
          ['/schedule', '/coaches', '/pricing', '/contacts'].includes(item[0]!),
        )"
        :key="item[0]"
        :to="item[0]"
        >{{ item[1] }}</NuxtLink
      >
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
      <NuxtLink class="mobile-trial" to="/contacts#application"
        >Первая тренировка бесплатно ↗</NuxtLink
      >
    </nav>
  </header>
</template>
