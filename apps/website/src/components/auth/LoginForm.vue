<script setup lang="ts">
import { computed, useId } from "vue";
import { useRouter } from "vue-router";
import AuthSwitchLink from "./AuthSwitchLink.vue";
import { loginSchema } from "./authSchemas.ts";
import FormAlert from "./FormAlert.vue";
import FormField from "./FormField.vue";
import PasswordInput from "./PasswordInput.vue";
import { useAuthStore } from "./useAuthStore.ts";
import { useSchemaForm } from "./useSchemaForm.ts";

/** Orden de los campos en pantalla: define a cuál va el foco si hay varios errores. */
const FIELDS = ["email", "password"] as const;

const titleId = useId();
const router = useRouter();
const auth = useAuthStore();

// Un error de un intento anterior (por ejemplo, antes de ir al registro y volver) no se muestra.
auth.clearError();

const { form, errors, isSubmitting, submit, fieldRef } = useSchemaForm({
  schema: loginSchema,
  fields: FIELDS,
  // Al editar cualquier campo se oculta "Email o contraseña incorrectos".
  onEdit: () => auth.clearError(),
  async onSubmit(data) {
    const ok = await auth.login(data.email, data.password);
    if (ok) await router.replace({ name: "home" });
  },
});

const isBusy = computed(() => isSubmitting.value || auth.isLoading);
</script>

<template>
  <div>
    <h1 :id="titleId" class="text-2xl font-bold text-gray-900">Iniciá sesión</h1>
    <p class="mt-2 text-sm text-gray-600">Ingresá tu email y tu contraseña para continuar.</p>

    <form class="mt-8 space-y-4" novalidate :aria-labelledby="titleId" @submit.prevent="submit">
      <FormAlert v-if="auth.loginError" variant="error">{{ auth.loginError }}</FormAlert>

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
            autocomplete="current-password"
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
        {{ isBusy ? "Ingresando..." : "Ingresar" }}
      </button>
    </form>

    <AuthSwitchLink
      question="¿No tenés cuenta?"
      link-text="Registrate"
      :to="{ name: 'register' }"
    />
  </div>
</template>
