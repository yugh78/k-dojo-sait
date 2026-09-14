<script setup lang="ts">
withDefaults(defineProps<{ title?: string; text?: string }>(), {
  title: "Скоро здесь появится больше",
  text: "Мы готовим материалы. Узнать подробности можно у администрации клуба.",
});
</script>
<template>
  <div class="empty-state">
    <span class="eyebrow">K-DOJO / ИНФОРМАЦИЯ</span>
    <h3>{{ title }}</h3>
    <p>{{ text }}</p>
  </div>
</template>
