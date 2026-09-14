<script setup lang="ts">
import type { FAQ } from "~/types/api";
defineProps<{ items: FAQ[] }>();
</script>
<template>
  <div class="faq">
    <details v-for="item in items" :key="item.id">
      <summary>{{ item.question }}<span aria-hidden="true">+</span></summary>
      <p>{{ item.answer }}</p>
    </details>
  </div>
</template>
