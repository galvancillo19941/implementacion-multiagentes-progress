<script setup lang="ts">
withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
  }>(),
  { alt: "" },
);
</script>

<template>
  <div
    class="relative overflow-hidden bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-500"
    :aria-hidden="src ? undefined : 'true'"
  >
    <img v-if="src" :src="src" :alt="alt" class="absolute inset-0 size-full object-cover" />
  </div>
</template>
