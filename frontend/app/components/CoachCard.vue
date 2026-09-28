<script setup lang="ts">
import type { Coach } from "~/types/api";
defineProps<{ coach: Coach }>();
</script>
<template>
  <article class="coach-card">
    <NuxtLink :to="'/coaches/' + coach.slug"
      ><ResponsiveImage
        v-if="coach.photo"
        :src="coach.photo"
        :alt="coach.full_name"
      />
      <div v-else class="coach-identity" aria-hidden="true">
        <img src="/brand/k-dojo.svg" alt="" width="56" height="56" />
        <span>ТРЕНЕРСКИЙ СОСТАВ / K–DOJO</span>
        <span class="card-arrow">↗</span>
      </div>
      <h3>{{ coach.full_name }}</h3></NuxtLink
    >
    <p>{{ coach.short_description }}</p>
    <NuxtLink class="text-link" :to="'/coaches/' + coach.slug"
      >О тренере ↗</NuxtLink
    >
  </article>
</template>
