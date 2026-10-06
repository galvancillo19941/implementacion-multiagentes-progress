<script setup lang="ts">
import LogoutButton from "../components/auth/LogoutButton.vue";
import UserGreeting from "../components/auth/UserGreeting.vue";
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-white px-6 py-12">
    <div class="flex w-full max-w-md flex-col items-center gap-8 text-center">
      <UserGreeting />
      <LogoutButton />
    </div>
  </main>
</template>
