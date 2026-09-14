<script setup lang="ts">
defineProps<{
  number?: string;
  title: string;
  eyebrow?: string;
  to?: string;
  linkText?: string;
}>();
</script>
<template>
  <div class="section-heading">
    <div>
      <p v-if="eyebrow" class="eyebrow">
        {{ number }} <span>{{ eyebrow }}</span>
      </p>
      <h2>{{ title }}</h2>
    </div>
    <NuxtLink v-if="to" class="text-link" :to="to"
      >{{ linkText || "Подробнее" }} ↗</NuxtLink
    >
  </div>
</template>
