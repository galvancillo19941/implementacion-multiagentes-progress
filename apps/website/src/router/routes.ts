import type { RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import { catchAllRoute } from "./authGuard.ts";

/**
 * Rutas de la app con sus marcas para los guards (`requiresAuth` / `guestOnly`, ver `authGuard.ts`).
 * Solo la lista, sin crear el router: la usan `router/index.ts` y las pruebas (`authGuard.test.ts`).
 */
export const routes: RouteRecordRaw[] = [
  { path: "/", name: "home", component: HomeView, meta: { requiresAuth: true } },
  { path: "/login", name: "login", component: LoginView, meta: { guestOnly: true } },
  { path: "/register", name: "register", component: RegisterView, meta: { guestOnly: true } },
  // Direcciones inexistentes → `/` (D15). Va última.
  catchAllRoute,
];
