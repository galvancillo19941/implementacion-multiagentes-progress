import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../components/auth/useAuthStore.ts";
import { getAuthRedirect } from "./authGuard.ts";
import { routes } from "./routes.ts";

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Sin sesión, `/` lleva a `/login`; con sesión, `/login` y `/register` llevan a `/`.
// Pinia ya está instalada (main.ts la registra antes que el router).
router.beforeEach((to) => getAuthRedirect(to, useAuthStore().isAuthenticated));
