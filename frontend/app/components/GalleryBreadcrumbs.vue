<script setup lang="ts">
defineProps<{ items: { title: string; to?: string }[] }>();
</script>
<template>
  <nav class="gallery-breadcrumbs" aria-label="Хлебные крошки">
    <ol>
      <li><NuxtLink to="/">Главная</NuxtLink></li>
      <li v-for="(item, index) in items" :key="index">
        <span aria-hidden="true">/</span>
        <NuxtLink v-if="item.to" :to="item.to">{{ item.title }}</NuxtLink>
        <span v-else aria-current="page">{{ item.title }}</span>
      </li>
    </ol>
  </nav>
</template>
