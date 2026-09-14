<script setup lang="ts">
defineProps<{ error?: unknown; pending?: boolean }>();
</script>
<template>
  <p v-if="pending" role="status">Загружаем данные…</p>
  <div v-else-if="error" class="api-error" role="alert">
    Не удалось загрузить данные. Обновите страницу или позвоните
    <a href="tel:+79250173216">+7 (925) 017-32-16</a>.
  </div>
  <slot v-else />
</template>
