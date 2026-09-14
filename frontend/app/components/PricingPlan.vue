<script setup lang="ts">
import { formatPrice } from "~/utils/format";
import type { PricingPlan } from "~/types/api";
defineProps<{ plan: PricingPlan }>();
const money = formatPrice;
</script>
<template>
  <article class="pricing-plan">
    <p class="eyebrow">
      {{ plan.category === "special" ? "Специальные условия" : "Абонемент" }}
    </p>
    <h3>{{ plan.name }}</h3>
    <div class="price">
      {{ money(plan.price) }} ₽ <small>/ {{ plan.billing_period }}</small>
    </div>
    <p v-if="plan.description">{{ plan.description }}</p>
    <p v-if="plan.eligibility">{{ plan.eligibility }}</p>
    <NuxtLink class="text-link" to="/contacts#application"
      >Уточнить условия ↗</NuxtLink
    >
  </article>
</template>
