<script setup lang="ts">
import type { ClubEvent } from "~/types/api";
defineProps<{ event: ClubEvent }>();
const dateText = (d: string) =>
  new Date(d + "T12:00:00").toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
</script>
<template>
  <article class="event-card">
    <NuxtLink :to="'/events/' + event.slug"
      ><ResponsiveImage
        v-if="event.cover_image"
        :src="event.cover_image"
        :alt="event.title"
      /><time :datetime="event.start_date">{{
        dateText(event.start_date)
      }}</time>
      <h3>{{ event.title }}</h3>
      <p>{{ event.description }}</p>
      <span class="text-link">О событии ↗</span></NuxtLink
    >
  </article>
</template>
