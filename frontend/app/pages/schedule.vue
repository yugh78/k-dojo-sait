<script setup lang="ts">
import { scheduleDays } from "~/utils/schedule";
usePageSeo("Расписание тренировок в Королёве");
const route = useRoute();
const router = useRouter();
const {
  program,
  age,
  coach,
  weekday,
  programs,
  coaches,
  entries,
  error,
  status,
} = useSchedule(String(route.query.program || ""));
watch(program, (value) =>
  router.replace({ query: { ...route.query, program: value || undefined } }),
);
watch(
  () => route.query.program,
  (value) => {
    program.value = String(value || "");
  },
);
</script>
<template>
  <div>
    <div class="container">
      <div class="page-heading">
        <p class="eyebrow">СПОРТ В ВАШЕМ РИТМЕ</p>
        <h1>Расписание</h1>
        <p class="lead">
          Найдите удобную группу. Если сомневаетесь — мы поможем выбрать.
        </p>
      </div>
      <section class="section">
        <ScheduleFilters
          v-model:program="program"
          v-model:age="age"
          v-model:coach="coach"
          v-model:weekday="weekday"
          :programs="programs || []"
          :coaches="coaches || []"
          show-weekday
        />
        <ApiState :error="error" :pending="status === 'pending'"
          ><div v-if="entries?.length" class="schedule-grid">
            <template v-for="(day, i) in scheduleDays" :key="day.short"
              ><ScheduleDay
                v-if="!weekday || weekday === String(i)"
                :day="day.name"
                :entries="entries.filter((e) => e.weekday === i)"
            /></template>
          </div>
          <EmptyState
            v-else
            title="По этим условиям групп нет"
            text="Попробуйте изменить фильтры или свяжитесь с клубом — поможем подобрать вариант."
        /></ApiState>
      </section>
    </div>
    <TrialBand />
  </div>
</template>
