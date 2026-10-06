import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { createMemoryHistory, createRouter } from "vue-router";
import { catchAllRoute, getAuthRedirect } from "./authGuard.ts";
import { routes } from "./routes.ts";

const home = { meta: { requiresAuth: true } };
const login = { meta: { guestOnly: true } };
const register = { meta: { guestOnly: true } };

describe("getAuthRedirect", () => {
  test("sin sesión, la home lleva al login", () => {
    expect(getAuthRedirect(home, false)).toEqual({ name: "login" });
  });

  test("con sesión, la home se muestra", () => {
    expect(getAuthRedirect(home, true)).toBeUndefined();
  });

  test("con sesión, login y registro llevan a la home", () => {
    expect(getAuthRedirect(login, true)).toEqual({ name: "home" });
    expect(getAuthRedirect(register, true)).toEqual({ name: "home" });
  });

  test("sin sesión, login y registro se muestran", () => {
    expect(getAuthRedirect(login, false)).toBeUndefined();
    expect(getAuthRedirect(register, false)).toBeUndefined();
  });

  test("una ruta sin marcas se muestra siempre", () => {
    expect(getAuthRedirect({ meta: {} }, false)).toBeUndefined();
    expect(getAuthRedirect({ meta: {} }, true)).toBeUndefined();
  });
});

/**
 * Router real en memoria con la misma lista de rutas que la app (`router/routes.ts`, que también
 * usa `router/index.ts`) y el guard. Cuenta las llamadas al guard para detectar bucles de redirección.
 */
function createTestRouter(isAuthenticated: boolean) {
  const router = createRouter({ history: createMemoryHistory(), routes });
  const guard = { calls: 0 };
  router.beforeEach((to) => {
    guard.calls += 1;
    return getAuthRedirect(to, isAuthenticated);
  });
  return { router, guard };
}

describe("ruta comodín (D15)", () => {
  const unknownPaths = ["/xyz", "/no/existe/nada", "/login/extra", "/xyz?a=1#b"];

  test.each(unknownPaths)("sin sesión, %s termina en /login sin bucles", async (path) => {
    const { router, guard } = createTestRouter(false);

    await router.push(path);

    expect(router.currentRoute.value.name).toBe("login");
    expect(router.currentRoute.value.path).toBe("/login");
    // Una llamada por la home (a la que redirige la comodín) y otra por el login.
    expect(guard.calls).toBeLessThanOrEqual(2);
  });

  test.each(unknownPaths)("con sesión, %s termina en / sin bucles", async (path) => {
    const { router, guard } = createTestRouter(true);

    await router.push(path);

    expect(router.currentRoute.value.name).toBe("home");
    expect(router.currentRoute.value.path).toBe("/");
    expect(guard.calls).toBeLessThanOrEqual(1);
  });

  test("las rutas existentes no pasan por la comodín", async () => {
    const guest = createTestRouter(false).router;
    await guest.push("/register");
    expect(guest.currentRoute.value.name).toBe("register");

    const logged = createTestRouter(true).router;
    await logged.push("/");
    expect(logged.currentRoute.value.name).toBe("home");
  });
});

describe("lista de rutas (router/routes.ts)", () => {
  test("tiene home, login y registro con sus marcas, y la comodín al final", () => {
    expect(routes.map((route) => [route.path, route.name, route.meta])).toEqual([
      ["/", "home", { requiresAuth: true }],
      ["/login", "login", { guestOnly: true }],
      ["/register", "register", { guestOnly: true }],
      [catchAllRoute.path, undefined, undefined],
    ]);
    expect(routes.at(-1)).toBe(catchAllRoute);
  });

  test("cada ruta con nombre tiene su vista", () => {
    for (const route of routes.filter((item) => item.name)) {
      expect(route.component).toBeDefined();
    }
  });
});

describe("ruta comodín sin aviso R0100 de vue-router", () => {
  let consoleWarn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarn = vi.spyOn(console, "warn");
  });

  afterEach(() => {
    consoleWarn.mockRestore();
  });

  test("redirige a la home sin pasarle parámetros", () => {
    expect(catchAllRoute.redirect).toEqual({ name: "home", params: {} });
  });

  test.each(["/xyz", "/no/existe/nada", "/xyz?a=1#b"])(
    "al ir a %s no se avisa nada por consola",
    async (path) => {
      for (const isAuthenticated of [false, true]) {
        const { router } = createTestRouter(isAuthenticated);
        await router.push(path);
      }

      const warnings = consoleWarn.mock.calls.map((args: unknown[]) => args.map(String).join(" "));
      expect(warnings.filter((text: string) => text.includes("R0100"))).toEqual([]);
      expect(warnings).toEqual([]);
    },
  );
});
