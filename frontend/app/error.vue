<script setup lang="ts">
import type { NuxtError } from "#app";
defineProps<{ error: NuxtError }>();
useSeoMeta({ title: "Страница недоступна — K-Dojo", robots: "noindex" });
</script>
<template>
  <main class="container section">
    <p class="eyebrow">K-DOJO / {{ error.statusCode }}</p>
    <h1>
      {{
        error.statusCode === 404
          ? "Страница не найдена"
          : "Не удалось открыть страницу"
      }}
    </h1>
    <p class="lead">Вернитесь на главную или свяжитесь с клубом.</p>
    <button class="button" @click="clearError({ redirect: '/' })">
      На главную ↗
    </button>
  </main>
</template>
