<script setup lang="ts">
import { LogOut } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { useAuthStore } from "./useAuthStore.ts";

const router = useRouter();
const auth = useAuthStore();

/** Cierra la sesión y vuelve al login con `replace`, así "Atrás" no vuelve a la home. */
async function onLogout() {
  auth.logout();
  await router.replace({ name: "login" });
}
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-600 px-4 py-2.5 font-semibold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none"
    @click="onLogout"
  >
    <LogOut class="size-5" aria-hidden="true" />
    Cerrar sesión
  </button>
</template>
