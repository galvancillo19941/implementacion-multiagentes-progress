<script setup lang="ts">
import { computed, useId, useTemplateRef } from "vue";

/**
 * Campo de formulario: label + control + mensaje de error.
 *
 * - Sin slot, muestra un `<input>` nativo enlazado con `v-model`.
 * - Con slot (por ejemplo `PasswordInput`), el slot recibe `id`, `describedby` e `invalid`
 *   para conectar el control con el label y con el error.
 * - El error vive en una región `aria-live="polite"` que siempre está en el DOM.
 * - `focus()` (expuesto) enfoca el primer control del campo.
 */
const props = withDefaults(
  defineProps<{
    label: string;
    error?: string;
    type?: string;
    autocomplete?: string;
  }>(),
  { error: "", type: "text", autocomplete: undefined },
);

const model = defineModel<string>({ default: "" });

defineSlots<{
  default?(slotProps: { id: string; describedby: string | undefined; invalid: boolean }): unknown;
}>();

const id = useId();
const errorId = `${id}-error`;
const invalid = computed(() => props.error !== "");
const describedby = computed(() => (invalid.value ? errorId : undefined));

const root = useTemplateRef<HTMLDivElement>("root");

function focus() {
  root.value?.querySelector<HTMLElement>("input, select, textarea")?.focus();
}

defineExpose({ focus });
</script>

<template>
  <div ref="root">
    <label :for="id" class="mb-1.5 block text-sm font-medium text-gray-700">{{ label }}</label>
    <slot :id="id" :describedby="describedby" :invalid="invalid">
      <input
        :id="id"
        v-model="model"
        :type="type"
        :autocomplete="autocomplete"
        :aria-invalid="invalid ? 'true' : 'false'"
        :aria-describedby="describedby"
        class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none aria-invalid:border-red-500 aria-invalid:focus:ring-red-500/20"
      />
    </slot>
    <p :id="errorId" aria-live="polite" class="mt-1 min-h-5 text-sm text-red-600">{{ error }}</p>
  </div>
</template>
