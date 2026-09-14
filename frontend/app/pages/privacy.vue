<script setup lang="ts">
import type { SiteSettings } from "~/types/api";
usePageSeo("Политика конфиденциальности");
const settings = inject<ComputedRef<SiteSettings | undefined>>("siteSettings");
</script>
<template>
  <div class="container section">
    <h1>Политика конфиденциальности</h1>
    <p v-if="settings?.privacy_text" class="prose">
      {{ settings.privacy_text }}
    </p>
    <div v-else class="legal-note">
      <p>
        Документ готовится к публикации. Юридические сведения оператора и
        утверждённая политика будут добавлены администрацией клуба.
      </p>
      <p>
        Для записи позвоните <a href="tel:+79250173216">+7 (925) 017-32-16</a>.
      </p>
    </div>
  </div>
</template>
