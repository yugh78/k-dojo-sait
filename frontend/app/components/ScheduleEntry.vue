<script setup lang="ts">
import type { ScheduleEntry } from "~/types/api";
defineProps<{ entry: ScheduleEntry }>();
</script>
<template>
  <article class="schedule-entry">
    <time
      >{{ entry.start_time.slice(0, 5) }}–{{ entry.end_time.slice(0, 5) }}</time
    >
    <h3>{{ entry.program.name }}</h3>
    <span class="eyebrow">{{ entry.audience }}</span>
    <p v-for="coach in entry.coaches" :key="coach.id">{{ coach.full_name }}</p>
    <p>{{ entry.location?.address || "Адрес уточняйте у администрации" }}</p>
    <p v-if="entry.notes">{{ entry.notes }}</p>
    <NuxtLink
      :to="{
        path: '/contacts',
        query: {
          program: entry.program.slug,
          group: entry.training_group.id,
          location: entry.location?.id,
        },
        hash: '#application',
      }"
      >Записаться в группу ↗</NuxtLink
    >
  </article>
</template>
