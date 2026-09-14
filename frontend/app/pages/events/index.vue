<script setup lang="ts">
import type { ClubEvent } from "~/types/api";
usePageSeo("События и сборы клуба");
const period = ref("upcoming");
const { data: events, error } = await useFetch<ClubEvent[]>("/api/events/", {
  query: { period },
});
</script>
<template>
  <div class="container">
    <div class="page-heading">
      <p class="eyebrow">ЖИЗНЬ K-DOJO</p>
      <h1>События</h1>
      <p class="lead">Сборы, соревнования, экзамены и встречи клуба.</p>
    </div>
    <section class="section">
      <div class="tabs">
        <button
          :aria-pressed="period === 'upcoming'"
          @click="period = 'upcoming'"
        >
          Предстоящие</button
        ><button :aria-pressed="period === 'past'" @click="period = 'past'">
          Архив
        </button>
      </div>
      <ApiState :error="error"
        ><div v-if="events?.length" class="grid-3">
          <EventCard v-for="event in events" :key="event.id" :event="event" />
        </div>
        <EmptyState
          v-else
          title="События готовятся к публикации"
          text="Подтверждённые даты и подробности появятся здесь. Следите за новостями клуба в Telegram."
      /></ApiState>
    </section>
  </div>
</template>
