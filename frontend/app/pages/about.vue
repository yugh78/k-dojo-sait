<script setup lang="ts">
import type { SiteSettings } from "~/types/api";
usePageSeo("О спортивном клубе");
const settings = inject<ComputedRef<SiteSettings | undefined>>("siteSettings");
</script>
<template>
  <div>
    <div class="container">
      <div class="page-heading">
        <p class="eyebrow">ОДИН КЛУБ. РАЗНЫЕ НАПРАВЛЕНИЯ.</p>
        <h1>Спорт.<br />Движение.<br />Характер.</h1>
        <p class="lead">{{ settings?.about_text }}</p>
      </div>
      <section class="section grid-2">
        <div>
          <h2>Ваш путь в спорте</h2>
          <p>
            Киокусинкай — основное историческое и соревновательное направление
            K-Dojo. BJJ и грэпплинг знакомят детей с борьбой и работой с
            партнёром. «Маугли» помогает детям 3–7 лет осваивать движение через
            физическую подготовку и игровые элементы.
          </p>
        </div>
        <div>
          <h2>В своём темпе</h2>
          <p>
            Новичку тоже можно прийти. Занятия не обязывают становиться
            профессиональным спортсменом. Для желающих и подготовленных
            участников есть соревновательная команда.
          </p>
          <NuxtLink class="text-link" to="/coaches"
            >Познакомиться с тренерами ↗</NuxtLink
          >
        </div>
      </section>
    </div>
    <TrialBand />
  </div>
</template>
