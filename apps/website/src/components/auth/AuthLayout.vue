<script setup lang="ts">
import AuthSideImage from "./AuthSideImage.vue";
</script>

<template>
  <main class="flex min-h-screen bg-white">
    <section class="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
      <div class="w-full max-w-md">
        <slot />
      </div>
    </section>
    <AuthSideImage class="hidden lg:block lg:w-1/2" />
  </main>
</template>
