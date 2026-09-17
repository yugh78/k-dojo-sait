<script setup lang="ts">
const route = useRoute();
</script>
<template>
  <ProgramPage
    :key="String(route.params.program)"
    :slug="String(route.params.program)"
  />
</template>
