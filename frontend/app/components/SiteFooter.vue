<script setup lang="ts">
import type { SiteSettings } from "~/types/api";
const settings = inject<ComputedRef<SiteSettings | undefined>>("siteSettings");
</script>
<template>
  <footer class="site-footer">
    <div class="container footer-top">
      <NuxtLink class="footer-brand" to="/"
        >K–DOJO<span>СПОРТ. ДВИЖЕНИЕ. ХАРАКТЕР.</span></NuxtLink
      >
      <div>
        <p>До встречи на тренировке.</p>
        <a :href="'tel:' + (settings?.phone || '+79250173216')">{{
          settings?.phone || "+7 (925) 017-32-16"
        }}</a
        ><br /><a :href="settings?.telegram || 'https://t.me/kdojokorolev'"
          >Наш Telegram ↗</a
        >
      </div>
    </div>
    <div class="container footer-bottom">
      <span>© {{ new Date().getFullYear() }} K-Dojo · Королёв</span
      ><NuxtLink to="/gallery">Галерея</NuxtLink
      ><NuxtLink to="/privacy">Конфиденциальность</NuxtLink
      ><NuxtLink to="/personal-data">Обработка персональных данных</NuxtLink>
    </div>
  </footer>
</template>
