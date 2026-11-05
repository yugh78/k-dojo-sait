<script setup lang="ts">
import type { Program, Coach } from "~/types/api";
import { scheduleDays } from "~/utils/schedule";
defineProps<{ programs: Program[]; coaches: Coach[]; showWeekday?: boolean }>();
const program = defineModel<string>("program", { required: true });
const age = defineModel<string>("age", { required: true });
const coach = defineModel<string>("coach", { required: true });
const weekday = defineModel<string>("weekday", { default: "" });
</script>
<template>
  <div class="filters schedule-filters">
    <label
      >Направление<select v-model="program" aria-label="Направление">
        <option value="">Все направления</option>
        <option v-for="item in programs" :key="item.id" :value="item.slug">
          {{ item.name }}
        </option>
      </select></label
    >
    <label
      >Возраст<input
        :value="age"
        type="number"
        inputmode="numeric"
        min="1"
        max="120"
        placeholder="Любой"
        @input="age = ($event.target as HTMLInputElement).value"
    /></label>
    <label
      >Тренер<select v-model="coach" aria-label="Тренер">
        <option value="">Все тренеры</option>
        <option v-for="item in coaches" :key="item.id" :value="String(item.id)">
          {{ item.full_name }}
        </option>
      </select></label
    >
    <label v-if="showWeekday"
      >День недели<select v-model="weekday" aria-label="День недели">
        <option value="">Вся неделя</option>
        <option
          v-for="(day, index) in scheduleDays"
          :key="day.short"
          :value="String(index)"
        >
          {{ day.name }}
        </option>
      </select></label
    >
  </div>
</template>
