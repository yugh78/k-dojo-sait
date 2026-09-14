<script setup lang="ts">
import type { Discount } from "~/types/api";
defineProps<{ discount: Discount }>();
</script>
<template>
  <article class="discount-card">
    <p class="value">
      {{
        discount.discount_type === "free"
          ? "Бесплатно"
          : "−" + Number(discount.discount_value) + "%"
      }}
    </p>
    <h3>{{ discount.name }}</h3>
    <p>{{ discount.description }}</p>
  </article>
</template>
