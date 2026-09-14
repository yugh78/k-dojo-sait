<script setup lang="ts">
import type { ScheduleEntry } from "~/types/api";
defineProps<{ day: string; entries: ScheduleEntry[] }>();
</script>
<template>
  <section class="schedule-day">
    <h2>
      {{ day }} <span>{{ entries.length }} занятий</span>
    </h2>
    <ScheduleEntry v-for="entry in entries" :key="entry.id" :entry="entry" />
  </section>
</template>
