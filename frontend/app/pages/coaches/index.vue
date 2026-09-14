<script setup lang="ts">
import type { Coach } from "~/types/api";
usePageSeo("Тренеры клуба");
const { data: coaches, error } = await useClubApi<Coach[]>("coaches");
</script>
<template>
  <div>
    <div class="container">
      <div class="page-heading">
        <p class="eyebrow">КОМАНДА K-DOJO</p>
        <h1>Тренеры</h1>
        <p class="lead">
          Люди, которые помогут сделать первый шаг и продолжать движение.
        </p>
      </div>
      <section class="section">
        <ApiState :error="error"
          ><div class="grid-3">
            <CoachCard
              v-for="coach in coaches"
              :key="coach.id"
              :coach="coach"
            /></div
        ></ApiState>
      </section>
    </div>
    <TrialBand />
  </div>
</template>
