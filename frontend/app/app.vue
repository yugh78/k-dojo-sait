<script setup lang="ts">
import type { SiteSettings } from "~/types/api";
const { data } = await useClubApi<SiteSettings[]>("settings");
const settings = computed(() => data.value?.[0]);
provide("siteSettings", settings);
</script>
<template>
  <a class="skip-link" href="#main">Перейти к содержанию</a>
  <SiteHeader />
  <main id="main"><NuxtPage /></main>
  <SiteFooter />
</template>
