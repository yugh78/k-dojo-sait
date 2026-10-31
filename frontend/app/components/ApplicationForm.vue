<script setup lang="ts">
import type { SiteSettings } from "~/types/api";
defineProps<{ programSlug?: string }>();
const { data } = useClubContent<SiteSettings[]>("settings");
const settings = computed(() => data.value?.[0]);
</script>
<template>
  <section id="application" class="application">
    <p class="eyebrow">ВАШ ПЕРВЫЙ ШАГ</p>
    <h2>Начнём с тренировки?</h2>
    <p>
      Первая тренировка бесплатная. Позвоните или напишите в клуб — поможем
      выбрать направление и согласуем удобную группу.
    </p>
    <p v-if="settings?.phone">
      <a class="button" :href="`tel:${settings.phone.replace(/[^+\d]/g, '')}`"
        >Позвонить в клуб</a
      >
    </p>
    <p v-if="settings?.phone">{{ settings.phone }}</p>
    <p v-if="settings?.telegram">
      <a
        class="button"
        :href="settings.telegram"
        target="_blank"
        rel="noopener noreferrer"
        >Написать в Telegram</a
      >
    </p>
  </section>
</template>
