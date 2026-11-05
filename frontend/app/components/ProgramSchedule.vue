<script setup lang="ts">
import type { ScheduleEntry } from "~/types/api";
import { groupSchedule } from "~/utils/schedule";

const props = defineProps<{ entries: ScheduleEntry[] }>();
const rows = computed(() => groupSchedule(props.entries));
const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
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
  </div>
  <p v-else class="muted">Расписание уточняйте у администрации клуба.</p>
</template>
