<script setup lang="ts">
import type { Location, SiteSettings } from "~/types/api";
usePageSeo("Контакты и запись на тренировку");
const { data: locations, error } = await useClubApi<Location[]>("locations");
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
        <h2>Наши залы</h2>
        <ApiState :error="error"
          ><article
            v-for="location in locations"
            :key="location.id"
            class="location-card"
          >
            <h2>{{ location.name }}</h2>
            <address>{{ location.address }}</address>
            <p v-if="location.entrance">{{ location.entrance }}</p>
            <ResponsiveImage
              v-if="location.photo"
              :src="location.photo"
              :alt="location.name"
            />
            <p>
              <a
                v-if="location.route_url"
                class="text-link"
                :href="location.route_url"
                target="_blank"
                rel="noopener noreferrer"
                >Открыть карту и маршрут ↗</a
              >
            </p>
          </article></ApiState
        >
        <p class="muted">
          Адреса групп Киокусинкай и «Маугли» уточняйте у администрации. Не все
          направления проходят в одном зале.
        </p>
        <NuxtLink class="text-link" to="/schedule">Расписание групп ↗</NuxtLink>
      </div>
      <ApplicationForm />
    </section>
  </div>
</template>
