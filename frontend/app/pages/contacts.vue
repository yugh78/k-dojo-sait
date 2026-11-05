<script setup lang="ts">
import type { SiteSettings } from "~/types/api";
usePageSeo("Контакты и запись на тренировку");
const settings = inject<ComputedRef<SiteSettings | undefined>>("siteSettings");
</script>
<template>
  <div class="container">
    <div class="page-heading">
      <p class="eyebrow">КОРОЛЁВ / МОСКОВСКАЯ ОБЛАСТЬ</p>
      <h1>До встречи<br />в K-Dojo.</h1>
      <p class="lead">
        <a :href="'tel:' + (settings?.phone || '+79250173216')">{{
          settings?.phone || "+7 (925) 017-32-16"
        }}</a>
      </p>
      <a
        class="text-link"
        :href="settings?.telegram || 'https://t.me/kdojokorolev'"
        >Telegram клуба ↗</a
      >
    </div>
    <section class="section grid-2">
      <div>
        <p class="eyebrow">ВАШ ПЕРВЫЙ ШАГ</p>
        <h2>Подберём группу.</h2>
        <p class="lead">
          Расскажите, для кого ищете занятия и какое направление интересно.
          Поможем выбрать удобную группу.
        </p>
        <NuxtLink class="text-link" to="/schedule"
          >Смотреть расписание ↗</NuxtLink
        >
      </div>
      <ApplicationForm />
    </section>
  </div>
</template>
