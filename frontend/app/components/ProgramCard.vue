<script setup lang="ts">
import type { Program } from "~/types/api";
defineProps<{ program: Program; index?: number }>();
</script>
<template>
  <NuxtLink
    :to="'/' + program.slug"
    class="program-card"
    :class="program.accent"
    ><ResponsiveImage :src="program.image" :alt="program.name" />
    <div class="program-card-body">
      <span class="eyebrow"
        >0{{ (index || 0) + 1 }} / {{ program.audience }}</span
      >
      <h3>
        {{
          program.slug === "kyokushin"
            ? "KYOKUSHIN"
            : program.slug === "bjj"
              ? "BJJ / GRAPPLING"
              : "МАУГЛИ"
        }}
      </h3>
      <p>{{ program.short_description }}</p>
      <span class="text-link">О направлении ↗</span>
    </div></NuxtLink
  >
</template>
