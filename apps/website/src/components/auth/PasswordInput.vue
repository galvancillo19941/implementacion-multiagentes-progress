<script setup lang="ts">
import { Eye, EyeOff } from "lucide-vue-next";
import { ref } from "vue";

/**
 * Input de contraseña con botón para mostrar u ocultar lo escrito.
 * Los atributos extra (`aria-invalid`, `aria-describedby`, etc.) van al `<input>`, no al contenedor.
 * `autocomplete`: "current-password" en el login, "new-password" en el registro.
 */
defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    id: string;
    autocomplete?: "current-password" | "new-password";
  }>(),
  { autocomplete: "current-password" },
);

const model = defineModel<string>({ default: "" });

const visible = ref(false);

function toggle() {
  visible.value = !visible.value;
}
</script>

<template>
  <div class="relative">
    <input
      v-bind="$attrs"
      :id="id"
      v-model="model"
      :type="visible ? 'text' : 'password'"
      :autocomplete="autocomplete"
      spellcheck="false"
      autocapitalize="none"
      class="block w-full rounded-lg border border-gray-300 bg-white py-2 pr-11 pl-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none aria-invalid:border-red-500 aria-invalid:focus:ring-red-500/20"
    />
    <button
      type="button"
      :aria-label="visible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
      :title="visible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
      :aria-controls="id"
      class="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-gray-500 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
      @click="toggle"
    >
      <EyeOff v-if="visible" class="size-5" aria-hidden="true" />
      <Eye v-else class="size-5" aria-hidden="true" />
    </button>
  </div>
</template>
