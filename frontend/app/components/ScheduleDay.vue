<script setup lang="ts">
import type { ScheduleEntry } from "~/types/api";
import { scheduleCount } from "~/utils/schedule";
defineProps<{ day: string; entries: ScheduleEntry[] }>();
</script>
<template>
  <section class="schedule-day">
    <h2>
      {{ day }} <span>{{ scheduleCount(entries.length) }}</span>
    </h2>
    <ScheduleEntry v-for="entry in entries" :key="entry.id" :entry="entry" />
    <p v-if="!entries.length" class="schedule-day-empty">Занятий нет</p>
  </section>
</template>
