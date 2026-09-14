<script setup lang="ts">
import type { SiteSettings } from "~/types/api";
const settings = inject<ComputedRef<SiteSettings | undefined>>("siteSettings");
</script>
<template>
  <section class="hero">
    <div v-if="settings?.hero_image" class="hero-media">
      <ResponsiveImage
        :src="settings.hero_image"
        alt="Тренировка в спортивном клубе K-Dojo"
        eager
      />
    </div>
    <div v-else class="hero-abstract" aria-hidden="true" />
    <span v-if="!settings?.hero_image" class="hero-note"
      >ФОТОГРАФИЯ КЛУБА СКОРО ПОЯВИТСЯ</span
    >
    <div class="container hero-content">
      <p class="eyebrow">КОРОЛЁВ / МОСКОВСКАЯ ОБЛАСТЬ</p>
      <h1>K–DOJO</h1>
      <h2>{{ settings?.hero_text || "Спортивный клуб в Королёве" }}</h2>
      <div class="hero-bottom">
        <div class="actions">
          <NuxtLink class="button" to="/contacts#application"
            >{{ settings?.cta_text || "Записаться бесплатно" }} ↗</NuxtLink
          ><a class="text-link" href="#programs">Выбрать направление ↓</a>
        </div>
        <p>
          Киокусинкай · BJJ · Маугли<br /><span class="eyebrow"
            >ДЕТИ · ПОДРОСТКИ · ВЗРОСЛЫЕ</span
          >
        </p>
      </div>
    </div>
  </section>
  <div class="container club-strip">
    <span>ОДИН КЛУБ. РАЗНЫЕ НАПРАВЛЕНИЯ.</span
    ><span>ДВИЖЕНИЕ В СВОЁМ ТЕМПЕ.</span><span>НАЧАТЬ МОЖЕТ КАЖДЫЙ.</span>
  </div>
</template>
