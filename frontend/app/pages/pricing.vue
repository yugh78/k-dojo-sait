<script setup lang="ts">
import type { PricingPlan, Discount } from "~/types/api";
usePageSeo("Стоимость тренировок");
const { data: plans, error } = await useClubApi<PricingPlan[]>("pricing");
const { data: discounts } = await useClubApi<Discount[]>("discounts");
</script>
<template>
  <div>
    <div class="container">
      <div class="page-heading">
        <p class="eyebrow">ПОНЯТНЫЕ УСЛОВИЯ</p>
        <h1>Стоимость</h1>
        <p class="lead">
          Выберите ритм занятий. Первая тренировка — бесплатно.
        </p>
      </div>
      <ApiState :error="error"
        ><section class="section">
          <SectionHeader title="Абонементы" />
          <div class="grid-3">
            <PricingPlan
              v-for="plan in plans?.filter((p) => p.category === 'standard')"
              :key="plan.id"
              :plan="plan"
            />
          </div>
        </section>
        <section class="section">
          <SectionHeader title="Специальные условия" />
          <div class="grid-2">
            <PricingPlan
              v-for="plan in plans?.filter((p) => p.category === 'special')"
              :key="plan.id"
              :plan="plan"
            />
          </div>
        </section>
        <section class="section">
          <SectionHeader eyebrow="ДОДЗЁ — НАШ ДОМ" title="Спорт всей семьёй." />
          <div class="grid-3">
            <DiscountCard
              v-for="discount in discounts"
              :key="discount.id"
              :discount="discount"
            />
          </div>
          <p class="lead">
            Условия одновременного применения нескольких льгот уточняйте у
            администрации клуба.
          </p>
          <p>
            Оплата только наличными. Фактическое применение льгот подтверждает
            администрация.
          </p>
        </section></ApiState
      >
    </div>
    <TrialBand />
  </div>
</template>
