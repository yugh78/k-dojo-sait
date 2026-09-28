<script setup lang="ts">
import type { ScheduleEntry } from "~/types/api";
import { groupSchedule } from "~/utils/schedule";

const props = defineProps<{ entries: ScheduleEntry[] }>();
const rows = computed(() => groupSchedule(props.entries));
const sharedNote = computed(() => {
  const note = props.entries[0]?.notes;
  return note && props.entries.every((entry) => entry.notes === note)
    ? note
    : "";
});
const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const locations = computed(() => [
  ...new Map(
    props.entries
      .filter((e) => e.location)
      .map((e) => [e.location!.id, e.location!]),
  ).values(),
]);
</script>
<template>
  <div v-if="rows.length" class="program-schedule">
    <table
      class="group-timetable"
      aria-label="Расписание групп по дням и времени"
    >
      <thead>
        <tr>
          <th scope="col">Группа</th>
          <th scope="col">Дни</th>
          <th scope="col">Время</th>
          <th scope="col">Тренер</th>
          <th scope="col">Запись</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.entry.id">
          <th scope="row" class="timetable-group">
            {{ row.entry.audience || row.entry.training_group.name }}
            <small
              v-if="
                locations.length > 1 ||
                (locations.length && entries.some((entry) => !entry.location))
              "
              >{{ row.entry.location?.name || "Зал уточняйте в клубе" }}</small
            >
            <small v-if="row.entry.notes && row.entry.notes !== sharedNote">{{
              row.entry.notes
            }}</small>
          </th>
          <td class="timetable-days">
            <span class="timetable-label" aria-hidden="true">Дни</span
            >{{ row.days.map((day) => days[day]).join(" · ") }}
          </td>
          <td class="timetable-time">
            <span class="timetable-label" aria-hidden="true">Время</span
            >{{ row.entry.start_time.slice(0, 5) }}–{{
              row.entry.end_time.slice(0, 5)
            }}
          </td>
          <td class="timetable-coach">
            <span class="timetable-label" aria-hidden="true">Тренер</span>
            <NuxtLink
              v-for="coach in row.entry.coaches"
              :key="coach.id"
              :to="'/coaches/' + coach.slug"
              >{{ coach.full_name }}</NuxtLink
            >
            <span v-if="!row.entry.coaches.length">Уточняйте в клубе</span>
          </td>
          <td class="timetable-action">
            <NuxtLink
              :to="{
                path: '/contacts',
                query: {
                  program: row.entry.program.slug,
                  group: row.entry.training_group.id,
                  location: row.entry.location?.id,
                },
                hash: '#application',
              }"
              :aria-label="'Записаться: ' + row.entry.training_group.name"
              class="text-link"
              >Записаться ↗</NuxtLink
            >
          </td>
        </tr>
      </tbody>
    </table>
    <div class="section-note">
      <p v-for="location in locations" :key="location.id">
        {{ location.name }}: {{ location.address }}
      </p>
      <p v-if="sharedNote">{{ sharedNote }}</p>
      <p v-if="!sharedNote && entries.some((entry) => !entry.location)">
        Адрес зала уточняйте при записи.
      </p>
    </div>
  </div>
  <p v-else class="muted">Расписание уточняйте у администрации клуба.</p>
</template>
