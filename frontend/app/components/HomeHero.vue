<script setup lang="ts">
import type { SiteSettings } from "~/types/api";
const settings = inject<ComputedRef<SiteSettings | undefined>>("siteSettings");
</script>
<template>
  <section class="hero">
    <div class="container hero-layout">
      <div class="hero-copy">
        <p class="eyebrow">
          <span class="status-dot" /> КОРОЛЁВ · КЛУБ ЕДИНОБОРСТВ
        </p>
        <h1>СИЛА.<br /><span>ХАРАКТЕР.</span><br />УВАЖЕНИЕ.</h1>
        <p class="hero-description">
          {{ settings?.hero_text || "Спортивный клуб в Королёве" }}.
          Киокусинкай, BJJ и занятия для детей «Маугли». Ваш путь начинается с
          первой тренировки.
        </p>
        <div class="actions">
          <NuxtLink class="button" to="/contacts#application">
            {{ settings?.cta_text || "Записаться бесплатно" }}
            <span aria-hidden="true">↗</span>
          </NuxtLink>
          <a class="hero-secondary" href="#programs"
            >Выбрать направление <span aria-hidden="true">↓</span></a
          >
        </div>
        <p class="hero-footnote">Без опыта. Без покупки экипировки заранее.</p>
      </div>
      <div class="hero-identity">
        <div v-if="settings?.hero_image" class="hero-photo">
          <ResponsiveImage
            :src="settings.hero_image"
            alt="Тренировка в клубе K-Dojo"
            eager
          />
        </div>
        <div v-else class="hero-emblem">
          <span class="identity-caption">KOROLEV / DOJO</span>
          <img
            src="/brand/k-dojo.svg"
            alt="Эмблема клуба K-Dojo"
            width="400"
            height="400"
            fetchpriority="high"
          />
          <span class="identity-caption">ДИСЦИПЛИНА ОБЪЕДИНЯЕТ</span>
        </div>
        <NuxtLink class="hero-invitation" to="/contacts#application">
          <span>ПЕРВЫЙ ШАГ<strong>Тренировка в подарок</strong></span>
          <span class="invitation-arrow" aria-hidden="true">↗</span>
        </NuxtLink>
      </div>
    </div>
    <div class="container hero-index">
      <span>K–DOJO / КОРОЛЁВ</span><span>ДЕТИ · ПОДРОСТКИ · ВЗРОСЛЫЕ</span
      ><a href="#programs">ЗНАКОМСТВО С КЛУБОМ ↓</a>
    </div>
  </section>
</template>
