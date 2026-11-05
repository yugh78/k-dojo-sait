<script setup lang="ts">
const open = ref(false);
const header = ref<HTMLElement | null>(null);
const hidden = ref(false);
let lastScrollY = 0;
const directions = ref<HTMLDetailsElement | null>(null);
function onScroll() {
  const scrollY = Math.max(0, window.scrollY);
  if (
    scrollY <= (header.value?.offsetHeight ?? 90) ||
    open.value ||
    directions.value?.open ||
    header.value?.contains(document.activeElement)
  ) {
    hidden.value = false;
    lastScrollY = scrollY;
    return;
  }
  if (Math.abs(scrollY - lastScrollY) < 8) return;
  hidden.value = scrollY > lastScrollY;
  lastScrollY = scrollY;
}
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
  lastScrollY = window.scrollY;
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("pointerdown", onOutsidePointer);
  document.addEventListener("keydown", onEscape);
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  document.removeEventListener("pointerdown", onOutsidePointer);
  document.removeEventListener("keydown", onEscape);
});
const route = useRoute();
watch(
  () => route.fullPath,
  () => {
    open.value = false;
    hidden.value = false;
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
  <header
    ref="header"
    class="site-header"
    :class="{ 'site-header-hidden': hidden }"
    @focusin="hidden = false"
  >
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
