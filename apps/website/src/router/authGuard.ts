import type { RouteLocationNormalized, RouteLocationRaw, RouteRecordRaw } from "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    /** Solo con sesión iniciada; sin sesión lleva al login. */
    requiresAuth?: boolean;
    /** Solo sin sesión (login, registro); con sesión lleva a la home. */
    guestOnly?: boolean;
  }
}

/**
 * Regla de los guards: a dónde redirigir según la ruta pedida y si hay sesión.
 * Devuelve `undefined` si se puede seguir a la ruta pedida.
 */
export function getAuthRedirect(
  to: Pick<RouteLocationNormalized, "meta">,
  isAuthenticated: boolean,
): RouteLocationRaw | undefined {
  if (to.meta.requiresAuth && !isAuthenticated) return { name: "login" };
  if (to.meta.guestOnly && isAuthenticated) return { name: "home" };
  return undefined;
}

/**
 * Ruta comodín (D15): cualquier dirección que no existe (por ejemplo `/xyz`) redirige a la home.
 * Desde ahí el guard lleva a `/login` si no hay sesión. No hay pantalla de "no encontrada".
 * Va última en la lista de rutas. `params: {}` evita que vue-router intente pasarle a la home el
 * parámetro `pathMatch` (que la home no tiene) y avise `[VUE_ROUTER_R0100]` en la consola.
 */
export const catchAllRoute: RouteRecordRaw = {
  path: "/:pathMatch(.*)*",
  redirect: { name: "home", params: {} },
};
