<script setup lang="ts">
import type { Program } from "~/types/api";
defineProps<{ programs: Program[] }>();
const active = ref("kyokushin");
</script>
<template>
  <section class="section dark-section">
    <div class="container">
      <SectionHeader
        number="03"
        eyebrow="ТРЕНИРОВОЧНЫЙ ПРОЦЕСС"
        title="Меньше слов. Больше движения."
      />
      <div class="tabs">
        <button
          v-for="program in programs"
          :key="program.id"
          :aria-pressed="active === program.slug"
          @click="active = program.slug"
        >
          {{ program.name }}
        </button>
      </div>
      <div class="steps">
        <article
          v-for="(step, i) in programs
            .find((p) => p.slug === active)
            ?.training_steps.split('\n')"
          :key="step"
          class="step"
        >
          <span>0{{ i + 1 }}</span>
          <h3>{{ step }}</h3>
        </article>
      </div>
    </div>
  </section>
</template>
