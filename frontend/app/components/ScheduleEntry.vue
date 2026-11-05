<script setup lang="ts">
import type { ScheduleEntry } from "~/types/api";
import { scheduleBookingLink } from "~/utils/schedule";
defineProps<{ entry: ScheduleEntry; bookInPlace?: boolean }>();
defineEmits<{ book: [entry: ScheduleEntry] }>();
</script>
<template>
  <article class="schedule-entry" :data-entry-id="entry.id">
    <time
      >{{ entry.start_time.slice(0, 5) }}–{{ entry.end_time.slice(0, 5) }}</time
    >
    <h3>{{ entry.program.name }}</h3>
    <span class="eyebrow">{{ entry.audience }}</span>
    <p v-for="coach in entry.coaches" :key="coach.id">{{ coach.full_name }}</p>
    <button
      v-if="bookInPlace"
      type="button"
      class="schedule-book button secondary"
      @click="$emit('book', entry)"
    >
      Записаться <span aria-hidden="true">↗</span>
    </button>
    <NuxtLink v-else :to="scheduleBookingLink(entry)"
      >Записаться в группу ↗</NuxtLink
    >
  </article>
</template>
