<script setup lang="ts">
import { CircleAlert, Info } from "lucide-vue-next";

/**
 * Mensaje general arriba de un formulario. El texto va en el slot.
 * - `error`: problemas que impiden seguir (`role="alert"`, se anuncia de inmediato).
 * - `info`: avisos informativos (`role="status"`, se anuncia sin interrumpir).
 */
withDefaults(
  defineProps<{
    variant?: "error" | "info";
  }>(),
  { variant: "info" },
);
</script>

<template>
  <div
    :role="variant === 'error' ? 'alert' : 'status'"
    class="flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm"
    :class="
      variant === 'error'
        ? 'border-red-200 bg-red-50 text-red-800'
        : 'border-indigo-200 bg-indigo-50 text-indigo-800'
    "
  >
    <CircleAlert v-if="variant === 'error'" class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
    <Info v-else class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
    <p><slot /></p>
  </div>
</template>
