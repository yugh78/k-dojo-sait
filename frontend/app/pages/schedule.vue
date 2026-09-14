<script setup lang="ts">
import type { ScheduleEntry, Program, Coach, Location } from "~/types/api";
usePageSeo("Расписание тренировок в Королёве");
const route = useRoute();
const router = useRouter();
const program = ref(String(route.query.program || ""));
const age = ref("");
const coach = ref("");
const location = ref("");
const weekday = ref("");
const { data: programs } = await useClubApi<Program[]>("programs");
const { data: coaches } = await useClubApi<Coach[]>("coaches");
const { data: locations } = await useClubApi<Location[]>("locations");
const query = computed(() => ({
  program: program.value,
  age: age.value,
  coach: coach.value,
  location: location.value,
  weekday: weekday.value,
}));
const {
  data: entries,
  error,
  status,
} = await useFetch<ScheduleEntry[]>("/api/schedule/", { query });
watch(program, (value) =>
  router.replace({ query: { ...route.query, program: value || undefined } }),
);
const days = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];
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
        <div class="filters">
          <label
            >Направление<select v-model="program" aria-label="Направление">
              <option value="">Все направления</option>
              <option v-for="p in programs" :key="p.id" :value="p.slug">
                {{ p.name }}
              </option>
            </select></label
          ><label
            >Возраст<input
              v-model="age"
              type="number"
              min="1"
              max="120"
              placeholder="Любой" /></label
          ><label
            >Тренер<select v-model="coach" aria-label="Тренер">
              <option value="">Все тренеры</option>
              <option v-for="c in coaches" :key="c.id" :value="String(c.id)">
                {{ c.full_name }}
              </option>
            </select></label
          ><label
            >Зал<select v-model="location" aria-label="Зал">
              <option value="">Все залы</option>
              <option v-for="l in locations" :key="l.id" :value="String(l.id)">
                {{ l.name }}
              </option>
            </select></label
          ><label
            >День недели<select v-model="weekday" aria-label="День недели">
              <option value="">Вся неделя</option>
              <option v-for="(day, i) in days" :key="day" :value="String(i)">
                {{ day }}
              </option>
            </select></label
          >
        </div>
        <ApiState :error="error" :pending="status === 'pending'"
          ><div v-if="entries?.length" class="schedule-grid">
            <template v-for="(day, i) in days" :key="day"
              ><ScheduleDay
                v-if="entries.some((e) => e.weekday === i)"
                :day="day"
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
