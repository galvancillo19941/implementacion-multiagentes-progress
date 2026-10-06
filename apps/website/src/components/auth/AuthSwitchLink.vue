<script setup lang="ts">
import { RouterLink, type RouteLocationRaw } from "vue-router";

/**
 * Enlace para pasar entre login y registro: una pregunta + el enlace (la parte accionable).
 * Ej.: "¿No tenés cuenta? Registrate".
 */
defineProps<{
  question: string;
  linkText: string;
  to: RouteLocationRaw;
}>();
</script>

<template>
  <p class="mt-6 text-center text-sm text-gray-600">
    {{ question }}
    <RouterLink
      :to="to"
      class="rounded-sm font-semibold text-indigo-600 underline-offset-4 hover:text-indigo-700 hover:underline focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      {{ linkText }}
    </RouterLink>
  </p>
</template>
