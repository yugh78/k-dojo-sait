<script setup lang="ts">
withDefaults(
  defineProps<{
    src?: string;
    alt: string;
    webp?: string;
    avif?: string;
    eager?: boolean;
  }>(),
  { src: "", webp: "", avif: "", eager: false },
);
</script>
<template>
  <picture v-if="src" class="picture"
    ><source v-if="avif" :srcset="avif" type="image/avif" />
    <source v-if="webp" :srcset="webp" type="image/webp" />
    <img
      :src="src"
      :alt="alt"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : 'auto'"
      width="1200"
      height="800"
  /></picture>
  <div
    v-else
    class="media-placeholder"
    role="img"
    :aria-label="alt + ': фотография готовится'"
  >
    <span aria-hidden="true">K<span class="seal">道</span></span
    ><small>ФОТОГРАФИЯ СКОРО ПОЯВИТСЯ</small>
  </div>
</template>
