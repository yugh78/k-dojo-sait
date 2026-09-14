<script setup lang="ts">
import type { SiteSettings } from "~/types/api";
usePageSeo("Согласие на обработку персональных данных");
const settings = inject<ComputedRef<SiteSettings | undefined>>("siteSettings");
</script>
<template>
  <div class="container section">
    <h1>Обработка персональных данных</h1>
    <p v-if="settings?.consent_text" class="prose">
      {{ settings.consent_text }}
    </p>
    <div v-else class="legal-note">
      <p>
        Текст согласия готовится. TODO: администрация должна заполнить сведения
        оператора, цели, сроки обработки и порядок отзыва согласия перед
        включением формы в production.
      </p>
      <p>
        Связаться с клубом: <a href="tel:+79250173216">+7 (925) 017-32-16</a>.
      </p>
    </div>
  </div>
</template>
