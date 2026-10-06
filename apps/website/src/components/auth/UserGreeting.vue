<script setup lang="ts">
import { useAuthStore } from "./useAuthStore.ts";

/** Saludo con el email del usuario de la sesión. */
const auth = useAuthStore();
</script>

<template>
  <h1 class="text-2xl font-bold wrap-anywhere text-gray-900">
    Hola, {{ auth.currentUser?.email }}
  </h1>
</template>
