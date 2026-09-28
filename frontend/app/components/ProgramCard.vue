<script setup lang="ts">
import type { Program } from "~/types/api";
defineProps<{ program: Program; index?: number }>();
</script>
<template>
  <NuxtLink :to="'/' + program.slug" class="program-card">
    <div class="program-card-top">
      <span class="program-number">{{
        String((index || 0) + 1).padStart(2, "0")
      }}</span>
      <span class="program-discipline">{{
        program.slug === "kyokushin"
          ? "КАРАТЭ"
          : program.slug === "bjj"
            ? "БРАЗИЛЬСКОЕ ДЖИУ-ДЖИТСУ"
            : program.slug === "mowgli"
              ? "ДЕТСКОЕ РАЗВИТИЕ"
              : "ЕДИНОБОРСТВА"
      }}</span>
      <span class="card-arrow" aria-hidden="true">↗</span>
    </div>
    <ResponsiveImage
      v-if="program.image"
      :src="program.image"
      :alt="program.name"
    />
    <div class="program-card-body">
      <h3>
        {{
          program.slug === "kyokushin"
            ? "Киокусинкай"
            : program.slug === "bjj"
              ? "BJJ / грэпплинг"
              : program.name
        }}
      </h3>
      <span class="program-audience">{{ program.audience }}</span>
      <p>{{ program.short_description }}</p>
      <span class="text-link"
        >О направлении <span aria-hidden="true">↗</span></span
      >
    </div>
  </NuxtLink>
</template>
