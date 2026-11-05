<script setup lang="ts">
import type { Coach } from "~/types/api";
defineProps<{ coach: Coach }>();
</script>
<template>
  <article class="coach-card">
    <NuxtLink
      class="coach-card-media"
      :to="'/coaches/' + coach.slug"
      :aria-label="coach.full_name"
      ><ResponsiveImage
        v-if="coach.photo"
        :class="{ 'coach-photo-cropped': coach.slug === 'timofeev' }"
        :src="coach.photo"
        :alt="coach.full_name"
      />
      <div v-else class="coach-identity" aria-hidden="true">
        <img src="/brand/k-dojo.svg" alt="" width="56" height="56" />
        <span>ТРЕНЕРСКИЙ СОСТАВ / K–DOJO</span>
        <span class="card-arrow">↗</span>
      </div>
    </NuxtLink>
    <div class="coach-card-body">
      <h3>
        <NuxtLink :to="'/coaches/' + coach.slug">{{
          coach.full_name
        }}</NuxtLink>
      </h3>
      <p>{{ coach.short_description }}</p>
      <NuxtLink class="text-link" :to="'/coaches/' + coach.slug"
        >О тренере <span aria-hidden="true">↗</span></NuxtLink
      >
    </div>
  </article>
</template>
