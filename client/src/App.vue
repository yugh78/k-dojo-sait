<script setup>
import HelloWorld from '@/components/HelloWorld.vue'
import TheWelcome from '@/components/TheWelcome.vue'
import TheHeader from '@/components/TheHeader.vue'

</script>

<template>
  <div>
  <header>
   
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>

  <main>
    <div></div>
    <TheHeader></TheHeader>
    <TheWelcome />
  </main>
</div>
</template>