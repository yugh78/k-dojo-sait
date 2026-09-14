<script setup lang="ts">
import type { Coach } from "~/types/api";
defineProps<{ coach: Coach }>();
</script>
<template>
  <article class="coach-card">
    <NuxtLink :to="'/coaches/' + coach.slug"
      ><ResponsiveImage :src="coach.photo" :alt="coach.full_name" />
      <h3>{{ coach.full_name }}</h3></NuxtLink
    >
    <p>{{ coach.short_description }}</p>
  </article>
</template>
