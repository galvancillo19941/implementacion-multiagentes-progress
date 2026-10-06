<script setup lang="ts">
import { computed, useId } from "vue";
import { useRouter } from "vue-router";
import AuthSwitchLink from "./AuthSwitchLink.vue";
import { AUTH_MESSAGES, registerSchema } from "./authSchemas.ts";
import FormAlert from "./FormAlert.vue";
import FormField from "./FormField.vue";
import PasswordInput from "./PasswordInput.vue";
import { useAuthStore } from "./useAuthStore.ts";
import { useSchemaForm } from "./useSchemaForm.ts";

/** Orden de los campos en pantalla: define a cuál va el foco si hay varios errores. */
const FIELDS = ["email", "password", "confirmPassword"] as const;

const titleId = useId();
const router = useRouter();
const auth = useAuthStore();

// Un error de un intento anterior (por ejemplo, antes de ir al login y volver) no se muestra.
auth.clearError();

const { form, errors, isSubmitting, submit, fieldRef } = useSchemaForm({
  schema: registerSchema,
  fields: FIELDS,
  onEdit(field, fieldErrors) {
    // "Las contraseñas no coinciden" depende de los dos campos: si se edita la contraseña, también se borra.
    if (field === "password" && fieldErrors.confirmPassword === AUTH_MESSAGES.passwordsMismatch) {
      fieldErrors.confirmPassword = "";
    }
    // Al editar cualquier campo se oculta "Ya existe una cuenta con ese email".
    auth.clearError();
  },
  async onSubmit(data) {
    const ok = await auth.register(data.email, data.password);
    if (ok) await router.replace({ name: "home" });
  },
});

const isBusy = computed(() => isSubmitting.value || auth.isLoading);
</script>

<template>
  <div>
    <h1 :id="titleId" class="text-2xl font-bold text-gray-900">Registrate</h1>
    <p class="mt-2 text-sm text-gray-600">Completá tus datos para crear tu cuenta.</p>

    <form class="mt-8 space-y-4" novalidate :aria-labelledby="titleId" @submit.prevent="submit">
      <FormAlert v-if="auth.registerError" variant="error">{{ auth.registerError }}</FormAlert>

      <FormField
        :ref="fieldRef('email')"
        v-model="form.email"
        label="Email"
        type="email"
        autocomplete="email"
        :error="errors.email"
      />

      <FormField :ref="fieldRef('password')" label="Contraseña" :error="errors.password">
        <template #default="{ id, describedby, invalid }">
          <PasswordInput
            :id="id"
            v-model="form.password"
            autocomplete="new-password"
            :aria-invalid="invalid ? 'true' : 'false'"
            :aria-describedby="describedby"
          />
        </template>
      </FormField>

      <FormField
        :ref="fieldRef('confirmPassword')"
        label="Confirmar contraseña"
        :error="errors.confirmPassword"
      >
        <template #default="{ id, describedby, invalid }">
          <PasswordInput
            :id="id"
            v-model="form.confirmPassword"
            autocomplete="new-password"
            :aria-invalid="invalid ? 'true' : 'false'"
            :aria-describedby="describedby"
          />
        </template>
      </FormField>

      <button
        type="submit"
        :disabled="isBusy"
        :aria-busy="isBusy ? 'true' : 'false'"
        class="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ isBusy ? "Creando cuenta..." : "Crear cuenta" }}
      </button>
    </form>

    <AuthSwitchLink
      question="¿Ya tenés cuenta?"
      link-text="Iniciá sesión"
      :to="{ name: 'login' }"
    />
  </div>
</template>
