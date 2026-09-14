<script setup lang="ts">
import type { Result } from "~/types/api";
usePageSeo("Результаты соревнований");
const { data: results, error } = await useClubApi<Result[]>("results");
const year = ref("");
const competition = ref("");
const years = computed(() =>
  [...new Set(results.value?.map((r) => r.competition.date.slice(0, 4)) || [])]
    .sort()
    .reverse(),
);
const competitions = computed(() =>
  Array.from(
    new Map(
      results.value?.map((r) => [r.competition.id, r.competition]) || [],
    ).values(),
  ),
);
const filtered = computed(
  () =>
    results.value?.filter(
      (r) =>
        (!year.value || r.competition.date.startsWith(year.value)) &&
        (!competition.value || String(r.competition.id) === competition.value),
    ) || [],
);
</script>
<template>
  <div class="container">
    <div class="page-heading">
      <p class="eyebrow">K-DOJO TEAM</p>
      <h1>Результаты</h1>
      <p class="lead">
        Соревновательная жизнь клуба — в людях, стартах и результатах.
      </p>
    </div>
    <section class="section">
      <div v-if="results?.length" class="filters">
        <label
          >Год<select v-model="year">
            <option value="">Все годы</option>
            <option v-for="y in years" :key="y">{{ y }}</option>
          </select></label
        ><label
          >Турнир<select v-model="competition">
            <option value="">Все турниры</option>
            <option v-for="c in competitions" :key="c.id" :value="String(c.id)">
              {{ c.title }}
            </option>
          </select></label
        >
      </div>
      <ApiState :error="error"
        ><div v-if="filtered.length" class="grid-3">
          <article
            v-for="result in filtered"
            :key="result.id"
            class="result-card"
          >
            <span class="eyebrow">{{ result.competition.date }}</span>
            <h3>{{ result.competition.title }}</h3>
            <p class="result-place">
              {{ result.place ? result.place + " место" : result.result_text }}
            </p>
            <p>{{ result.athlete.full_name }}</p>
            <p>{{ result.category }}</p>
          </article>
        </div>
        <EmptyState
          v-else
          title="Архив результатов готовится"
          text="Публикуем только подтверждённые результаты. Материалы появятся после проверки клубом."
      /></ApiState>
    </section>
  </div>
</template>
