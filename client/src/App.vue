<script setup>
import HelloWorld from './components/HelloWorld.vue'
import { ref } from 'vue'
let routes = ref([{ url: "/", displayName: "Главная" }, { url: "/about", displayName: "О сайте" }])
</script>

<template>
  <nav class="flex flex-row gap-2">
    <div v-for="route in routes">
      <RouterLink :to="route.url">
        {{ route.displayName }}
      </RouterLink>
    </div>
    <!-- <RouterLink to="/">Главная</RouterLink> -->
    <!-- <RouterLink to="/about">О сайте</RouterLink> -->
  </nav>
  <main>
    <RouterView />
  </main>
</template>
