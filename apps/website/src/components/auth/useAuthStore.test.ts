import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { AUTH_MESSAGES } from "./authSchemas.ts";
import { MemoryStorage } from "./testStorage.ts";
import { defineAuthStore } from "./useAuthStore.ts";
import { SESSION_KEY, USERS_KEY, addUser, getUsers } from "./userStorage.ts";

const DEMO_EMAIL = "demo@demo.com";
const DEMO_PASSWORD = "demo1234";

let storage: MemoryStorage;

/** Store nuevo, con una Pinia nueva (como si se cargara la app de nuevo) sobre el mismo storage. */
function createStore() {
  setActivePinia(createPinia());
  return defineAuthStore(storage)();
}

function readSessionRaw(): string | null {
  return storage.getItem(SESSION_KEY);
}

beforeEach(() => {
  storage = new MemoryStorage();
});

describe("estado inicial", () => {
  test("sin auth.session no hay sesión", () => {
    const store = createStore();
    expect(store.currentUser).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.isLoading).toBe(false);
    expect(store.loginError).toBeNull();
  });
});

describe("login", () => {
  test("correcto con demo@demo.com / demo1234: deja la sesión iniciada", async () => {
    const store = createStore();

    const ok = await store.login(DEMO_EMAIL, DEMO_PASSWORD);

    expect(ok).toBe(true);
    expect(store.currentUser).toEqual({ email: DEMO_EMAIL });
    expect(store.isAuthenticated).toBe(true);
    expect(store.loginError).toBeNull();
  });

  test("con el email en mayúsculas y con espacios guarda el email normalizado", async () => {
    const store = createStore();

    const ok = await store.login("  DEMO@Demo.com ", DEMO_PASSWORD);

    expect(ok).toBe(true);
    expect(store.currentUser).toEqual({ email: DEMO_EMAIL });
    expect(JSON.parse(readSessionRaw() ?? "null")).toEqual({ email: DEMO_EMAIL });
  });

  test("contraseña incorrecta: sin sesión y con 'Email o contraseña incorrectos'", async () => {
    const store = createStore();

    const ok = await store.login(DEMO_EMAIL, "otra-clave");

    expect(ok).toBe(false);
    expect(store.currentUser).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.loginError).toBe("Email o contraseña incorrectos");
    expect(readSessionRaw()).toBeNull();
  });

  test("email inexistente: sin sesión y con el mismo error", async () => {
    const store = createStore();

    const ok = await store.login("nadie@demo.com", DEMO_PASSWORD);

    expect(ok).toBe(false);
    expect(store.currentUser).toBeNull();
    expect(store.loginError).toBe(AUTH_MESSAGES.invalidCredentials);
    expect(readSessionRaw()).toBeNull();
  });

  test("contraseña incorrecta y email inexistente dan exactamente el mismo resultado", async () => {
    const wrongPassword = createStore();
    const resultA = await wrongPassword.login(DEMO_EMAIL, "otra-clave");

    const unknownEmail = createStore();
    const resultB = await unknownEmail.login("nadie@demo.com", DEMO_PASSWORD);

    expect(resultA).toBe(resultB);
    expect(wrongPassword.loginError).toBe(unknownEmail.loginError);
    expect(wrongPassword.currentUser).toEqual(unknownEmail.currentUser);
  });

  test("un login correcto después de uno fallido borra el error", async () => {
    const store = createStore();
    await store.login(DEMO_EMAIL, "otra-clave");
    expect(store.loginError).not.toBeNull();

    await store.login(DEMO_EMAIL, DEMO_PASSWORD);

    expect(store.loginError).toBeNull();
    expect(store.isAuthenticated).toBe(true);
  });

  test("clearError oculta el error", async () => {
    const store = createStore();
    await store.login(DEMO_EMAIL, "otra-clave");

    store.clearError();

    expect(store.loginError).toBeNull();
  });
});

describe("isLoading", () => {
  test("false antes, true durante y false después de un login correcto", async () => {
    const store = createStore();
    expect(store.isLoading).toBe(false);

    const pending = store.login(DEMO_EMAIL, DEMO_PASSWORD);
    expect(store.isLoading).toBe(true);

    await pending;
    expect(store.isLoading).toBe(false);
  });

  test("false antes, true durante y false después de un login fallido", async () => {
    const store = createStore();
    expect(store.isLoading).toBe(false);

    const pending = store.login(DEMO_EMAIL, "otra-clave");
    expect(store.isLoading).toBe(true);

    await pending;
    expect(store.isLoading).toBe(false);
  });

  test("mientras procesa, un segundo login se ignora (sin doble envío)", async () => {
    const store = createStore();

    const first = store.login(DEMO_EMAIL, DEMO_PASSWORD);
    const second = store.login(DEMO_EMAIL, "otra-clave");

    expect(await second).toBe(false);
    expect(await first).toBe(true);
    expect(store.currentUser).toEqual({ email: DEMO_EMAIL });
    expect(store.loginError).toBeNull();
    expect(store.isLoading).toBe(false);
  });
});

describe("sesión guardada y restaurada", () => {
  test("el login correcto guarda en auth.session solo el email", async () => {
    const store = createStore();
    await store.login(DEMO_EMAIL, DEMO_PASSWORD);

    expect(JSON.parse(readSessionRaw() ?? "null")).toEqual({ email: DEMO_EMAIL });
  });

  test("al cargar la app de nuevo la sesión se restaura", async () => {
    await createStore().login(DEMO_EMAIL, DEMO_PASSWORD);

    const reloaded = createStore();

    expect(reloaded.currentUser).toEqual({ email: DEMO_EMAIL });
    expect(reloaded.isAuthenticated).toBe(true);
  });

  test("si auth.session trae claves de más, al restaurar solo queda el email", () => {
    storage.setItem(
      SESSION_KEY,
      JSON.stringify({ email: DEMO_EMAIL, passwordHash: "abc", salt: "def", password: "x" }),
    );

    const store = createStore();

    expect(store.currentUser).toEqual({ email: DEMO_EMAIL });
    expect(Object.keys(store.currentUser ?? {})).toEqual(["email"]);
  });

  test.each([
    ["JSON roto", "{email:"],
    ["texto suelto", "hola"],
    ["null", "null"],
    ["número", "123"],
    ["string JSON", '"demo@demo.com"'],
    ["lista", "[]"],
    ["objeto vacío", "{}"],
    ["email vacío", '{"email":""}'],
    ["email que no es texto", '{"email":42}'],
  ])("auth.session con %s se toma como sin sesión, sin fallar", (_name, raw) => {
    storage.setItem(SESSION_KEY, raw);

    const store = createStore();

    expect(store.currentUser).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  test("con auth.session roto igual se puede iniciar sesión", async () => {
    storage.setItem(SESSION_KEY, "{roto");
    const store = createStore();

    const ok = await store.login(DEMO_EMAIL, DEMO_PASSWORD);

    expect(ok).toBe(true);
    expect(JSON.parse(readSessionRaw() ?? "null")).toEqual({ email: DEMO_EMAIL });
  });

  test("un storage que falla al leer se toma como sin sesión", () => {
    storage.getItem = () => {
      throw new Error("storage no disponible");
    };

    const store = createStore();

    expect(store.currentUser).toBeNull();
  });
});

describe("logout", () => {
  test("limpia el estado y borra auth.session", async () => {
    const store = createStore();
    await store.login(DEMO_EMAIL, DEMO_PASSWORD);

    store.logout();

    expect(store.currentUser).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.loginError).toBeNull();
    expect(readSessionRaw()).toBeNull();
  });

  test("después del logout, al cargar la app de nuevo sigue sin sesión", async () => {
    const store = createStore();
    await store.login(DEMO_EMAIL, DEMO_PASSWORD);
    store.logout();

    const reloaded = createStore();

    expect(reloaded.currentUser).toBeNull();
    expect(reloaded.isAuthenticated).toBe(false);
  });

  test("no borra los usuarios guardados", async () => {
    const store = createStore();
    await store.login(DEMO_EMAIL, DEMO_PASSWORD);
    const usersBefore = storage.getItem(USERS_KEY);

    store.logout();

    expect(storage.getItem(USERS_KEY)).toBe(usersBefore);
    expect(await createStore().login(DEMO_EMAIL, DEMO_PASSWORD)).toBe(true);
  });
});

describe("nada sensible", () => {
  test("ni contraseña, ni hash, ni sal en el estado ni en auth.session", async () => {
    const store = createStore();
    await store.login(DEMO_EMAIL, DEMO_PASSWORD);

    const [seed] = await getUsers(storage);
    expect(seed).toBeDefined();
    const stateJson = JSON.stringify(store.$state);
    const sessionRaw = readSessionRaw() ?? "";

    for (const secret of [DEMO_PASSWORD, seed?.passwordHash ?? "", seed?.salt ?? ""]) {
      expect(secret).not.toBe("");
      expect(stateJson).not.toContain(secret);
      expect(sessionRaw).not.toContain(secret);
    }
    for (const key of ["password", "passwordHash", "salt"]) {
      expect(stateJson).not.toContain(key);
      expect(sessionRaw).not.toContain(key);
    }
    expect(Object.keys(store.currentUser ?? {})).toEqual(["email"]);
    expect(Object.keys(JSON.parse(sessionRaw))).toEqual(["email"]);
  });

  test("con un login fallido tampoco queda la contraseña en el estado", async () => {
    const store = createStore();
    await store.login(DEMO_EMAIL, "clave-equivocada");

    expect(JSON.stringify(store.$state)).not.toContain("clave-equivocada");
    expect(readSessionRaw()).toBeNull();
  });
});

describe("register", () => {
  const NEW_EMAIL = "nueva@demo.com";
  const NEW_PASSWORD = "clave-nueva-123";

  test("crea el usuario en auth.users con hash y sal, sin la contraseña en claro", async () => {
    const store = createStore();

    const ok = await store.register(NEW_EMAIL, NEW_PASSWORD);

    expect(ok).toBe(true);
    const users = await getUsers(storage);
    const created = users.find((user) => user.email === NEW_EMAIL);
    expect(created).toBeDefined();
    expect(Object.keys(created ?? {}).sort()).toEqual(["email", "passwordHash", "salt"]);
    expect(created?.passwordHash).not.toBe("");
    expect(created?.salt).not.toBe("");
    expect(created?.passwordHash).not.toBe(NEW_PASSWORD);
    expect(storage.getItem(USERS_KEY)).not.toContain(NEW_PASSWORD);
    // El usuario semilla sigue estando.
    expect(users.some((user) => user.email === DEMO_EMAIL)).toBe(true);
  });

  test("guarda el email normalizado (minúsculas, sin espacios)", async () => {
    const store = createStore();

    const ok = await store.register("  Nueva@DEMO.com ", NEW_PASSWORD);

    expect(ok).toBe(true);
    expect(store.currentUser).toEqual({ email: NEW_EMAIL });
    const users = await getUsers(storage);
    expect(users.filter((user) => user.email === NEW_EMAIL)).toHaveLength(1);
  });

  test("deja la sesión iniciada: currentUser y auth.session solo con el email", async () => {
    const store = createStore();

    await store.register(NEW_EMAIL, NEW_PASSWORD);

    expect(store.currentUser).toEqual({ email: NEW_EMAIL });
    expect(store.isAuthenticated).toBe(true);
    expect(store.registerError).toBeNull();
    expect(Object.keys(store.currentUser ?? {})).toEqual(["email"]);
    expect(JSON.parse(readSessionRaw() ?? "null")).toEqual({ email: NEW_EMAIL });
  });

  test("al cargar la app de nuevo la sesión del usuario registrado se restaura", async () => {
    await createStore().register(NEW_EMAIL, NEW_PASSWORD);

    const reloaded = createStore();

    expect(reloaded.currentUser).toEqual({ email: NEW_EMAIL });
    expect(reloaded.isAuthenticated).toBe(true);
  });

  test("después del logout se puede volver a entrar con ese usuario", async () => {
    const store = createStore();
    await store.register(NEW_EMAIL, NEW_PASSWORD);
    store.logout();
    expect(store.isAuthenticated).toBe(false);
    expect(readSessionRaw()).toBeNull();

    const ok = await store.login(NEW_EMAIL, NEW_PASSWORD);

    expect(ok).toBe(true);
    expect(store.currentUser).toEqual({ email: NEW_EMAIL });
    expect(JSON.parse(readSessionRaw() ?? "null")).toEqual({ email: NEW_EMAIL });
  });

  test("después del logout, una contraseña equivocada no entra", async () => {
    const store = createStore();
    await store.register(NEW_EMAIL, NEW_PASSWORD);
    store.logout();

    expect(await store.login(NEW_EMAIL, "otra-clave")).toBe(false);
    expect(store.loginError).toBe(AUTH_MESSAGES.invalidCredentials);
  });

  test.each([
    ["el usuario semilla", DEMO_EMAIL],
    ["el usuario semilla en otras mayúsculas", "Demo@DEMO.com"],
    ["el usuario semilla con espacios", "  demo@demo.com  "],
  ])("email duplicado (%s) falla con su mensaje y no inicia sesión", async (_name, email) => {
    const store = createStore();
    await getUsers(storage); // crea el usuario semilla antes de mirar auth.users
    const usersBefore = storage.getItem(USERS_KEY);
    expect(usersBefore).not.toBeNull();

    const ok = await store.register(email, NEW_PASSWORD);

    expect(ok).toBe(false);
    expect(store.registerError).toBe("Ya existe una cuenta con ese email");
    expect(store.registerError).toBe(AUTH_MESSAGES.emailTaken);
    expect(store.currentUser).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(readSessionRaw()).toBeNull();
    // No se agregó ni se pisó ningún usuario.
    expect(storage.getItem(USERS_KEY)).toBe(usersBefore);
  });

  test.each([
    ["el mismo email", NEW_EMAIL],
    ["otras mayúsculas", "NUEVA@Demo.COM"],
    ["espacios", "  nueva@demo.com "],
  ])("un usuario recién registrado no se puede registrar de nuevo (%s)", async (_name, email) => {
    await createStore().register(NEW_EMAIL, NEW_PASSWORD);
    const store = createStore();
    store.logout();

    const ok = await store.register(email, "otra-clave-456");

    expect(ok).toBe(false);
    expect(store.registerError).toBe(AUTH_MESSAGES.emailTaken);
    expect(store.currentUser).toBeNull();
    expect(readSessionRaw()).toBeNull();
    // La contraseña original sigue valiendo; la nueva no.
    expect(await store.login(NEW_EMAIL, "otra-clave-456")).toBe(false);
    expect(await store.login(NEW_EMAIL, NEW_PASSWORD)).toBe(true);
  });

  test("un email duplicado no cambia una sesión ya iniciada", async () => {
    const store = createStore();
    await store.login(DEMO_EMAIL, DEMO_PASSWORD);

    const ok = await store.register(DEMO_EMAIL, NEW_PASSWORD);

    expect(ok).toBe(false);
    expect(store.registerError).toBe(AUTH_MESSAGES.emailTaken);
    expect(store.currentUser).toEqual({ email: DEMO_EMAIL });
    expect(JSON.parse(readSessionRaw() ?? "null")).toEqual({ email: DEMO_EMAIL });
  });

  test("un registro correcto después de uno fallido borra el error", async () => {
    const store = createStore();
    await store.register(DEMO_EMAIL, NEW_PASSWORD);
    expect(store.registerError).not.toBeNull();

    expect(await store.register(NEW_EMAIL, NEW_PASSWORD)).toBe(true);

    expect(store.registerError).toBeNull();
  });

  test("clearError y logout ocultan el error de registro", async () => {
    const store = createStore();
    await store.register(DEMO_EMAIL, NEW_PASSWORD);

    store.clearError();
    expect(store.registerError).toBeNull();

    await store.register(DEMO_EMAIL, NEW_PASSWORD);
    store.logout();
    expect(store.registerError).toBeNull();
  });

  test("el error de registro no aparece como error de login (y al revés)", async () => {
    const store = createStore();

    await store.register(DEMO_EMAIL, NEW_PASSWORD);
    expect(store.loginError).toBeNull();

    store.clearError();
    await store.login(DEMO_EMAIL, "otra-clave");
    expect(store.registerError).toBeNull();
  });

  describe("isLoading", () => {
    test("false antes, true durante y false después de un registro correcto", async () => {
      const store = createStore();
      expect(store.isLoading).toBe(false);

      const pending = store.register(NEW_EMAIL, NEW_PASSWORD);
      expect(store.isLoading).toBe(true);

      await pending;
      expect(store.isLoading).toBe(false);
    });

    test("false antes, true durante y false después de un email duplicado", async () => {
      const store = createStore();
      expect(store.isLoading).toBe(false);

      const pending = store.register(DEMO_EMAIL, NEW_PASSWORD);
      expect(store.isLoading).toBe(true);

      await pending;
      expect(store.isLoading).toBe(false);
    });

    test("mientras procesa, un segundo registro se ignora (sin doble envío)", async () => {
      const store = createStore();

      const first = store.register(NEW_EMAIL, NEW_PASSWORD);
      const second = store.register("otra@demo.com", NEW_PASSWORD);

      expect(await second).toBe(false);
      expect(await first).toBe(true);
      expect(store.registerError).toBeNull();
      expect(store.currentUser).toEqual({ email: NEW_EMAIL });
      expect(store.isLoading).toBe(false);
      const users = await getUsers(storage);
      expect(users.map((user) => user.email).sort()).toEqual([DEMO_EMAIL, NEW_EMAIL].sort());
    });

    test("mientras procesa un login, un registro se ignora", async () => {
      const store = createStore();

      const login = store.login(DEMO_EMAIL, DEMO_PASSWORD);
      const register = store.register(NEW_EMAIL, NEW_PASSWORD);

      expect(await register).toBe(false);
      expect(await login).toBe(true);
      expect(store.currentUser).toEqual({ email: DEMO_EMAIL });
      expect((await getUsers(storage)).some((user) => user.email === NEW_EMAIL)).toBe(false);
    });
  });

  describe("nada sensible", () => {
    test("ni contraseña, ni hash, ni sal en el estado ni en auth.session", async () => {
      const store = createStore();
      await store.register(NEW_EMAIL, NEW_PASSWORD);

      const created = (await getUsers(storage)).find((user) => user.email === NEW_EMAIL);
      expect(created).toBeDefined();
      const stateJson = JSON.stringify(store.$state);
      const sessionRaw = readSessionRaw() ?? "";

      for (const secret of [NEW_PASSWORD, created?.passwordHash ?? "", created?.salt ?? ""]) {
        expect(secret).not.toBe("");
        expect(stateJson).not.toContain(secret);
        expect(sessionRaw).not.toContain(secret);
      }
      for (const key of ["password", "passwordHash", "salt"]) {
        expect(stateJson).not.toContain(key);
        expect(sessionRaw).not.toContain(key);
      }
      expect(Object.keys(JSON.parse(sessionRaw))).toEqual(["email"]);
    });

    test("con un email duplicado tampoco queda la contraseña en el estado", async () => {
      const store = createStore();
      await store.register(DEMO_EMAIL, "clave-del-duplicado");

      expect(JSON.stringify(store.$state)).not.toContain("clave-del-duplicado");
      expect(storage.getItem(USERS_KEY)).not.toContain("clave-del-duplicado");
      expect(readSessionRaw()).toBeNull();
    });
  });
});

/** Hace que `storage.getItem(key)` lance, como un storage que deja de responder. */
function failOnGet(key: string): void {
  const original = storage.getItem.bind(storage);
  storage.getItem = (k: string) => {
    if (k === key) throw new Error("storage no disponible");
    return original(k);
  };
}

/** Hace que `storage.setItem(key, ...)` lance, como un storage lleno. */
function failOnSet(key: string): void {
  const original = storage.setItem.bind(storage);
  storage.setItem = (k: string, value: string) => {
    if (k === key) throw new Error("storage lleno");
    original(k, value);
  };
}

describe("al restaurar, el email de auth.session tiene que existir en auth.users", () => {
  function saveSession(email: string): void {
    storage.setItem(SESSION_KEY, JSON.stringify({ email }));
  }

  test("un email que no está en auth.users se toma como sin sesión", async () => {
    await getUsers(storage); // crea el usuario semilla
    saveSession("inventado@demo.com");

    const store = createStore();

    expect(store.currentUser).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  test("un usuario registrado se restaura", async () => {
    await addUser("ana@mail.com", "secreta123", storage);
    saveSession("ana@mail.com");

    expect(createStore().currentUser).toEqual({ email: "ana@mail.com" });
  });

  test("un email guardado en otras mayúsculas o con espacios se restaura normalizado", async () => {
    await getUsers(storage);
    saveSession("  DEMO@Demo.com ");

    const store = createStore();

    expect(store.currentUser).toEqual({ email: DEMO_EMAIL });
  });

  test("con el usuario semilla todavía no creado, la sesión del semilla se restaura", () => {
    saveSession(DEMO_EMAIL);
    expect(storage.getItem(USERS_KEY)).toBeNull();

    expect(createStore().currentUser).toEqual({ email: DEMO_EMAIL });
  });

  test("con el usuario semilla todavía no creado, otro email no se restaura", () => {
    saveSession("ana@mail.com");

    expect(createStore().currentUser).toBeNull();
  });

  test("con auth.users roto, solo cuenta el usuario semilla (que se va a volver a crear)", async () => {
    storage.setItem(USERS_KEY, "{roto");
    saveSession(DEMO_EMAIL);
    expect(createStore().currentUser).toEqual({ email: DEMO_EMAIL });

    saveSession("ana@mail.com");
    expect(createStore().currentUser).toBeNull();
  });

  test("si el usuario semilla ya no está (hay otros usuarios), su sesión no se restaura", async () => {
    storage.setItem(
      USERS_KEY,
      JSON.stringify([{ email: "ana@mail.com", passwordHash: "x", salt: "y" }]),
    );
    saveSession(DEMO_EMAIL);

    expect(createStore().currentUser).toBeNull();
  });

  test("restaurar no espera nada: el estado está listo apenas se crea el store", async () => {
    await addUser("ana@mail.com", "secreta123", storage);
    saveSession("ana@mail.com");

    const store = createStore();

    // Sin `await` en el medio: el guard del router lee `isAuthenticated` en el acto.
    expect(store.isAuthenticated).toBe(true);
  });

  test("si falla la lectura de auth.users se toma como sin sesión, sin lanzar", () => {
    saveSession(DEMO_EMAIL);
    failOnGet(USERS_KEY);

    expect(createStore().currentUser).toBeNull();
  });
});

describe("fallas inesperadas", () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // El store informa la falla por consola; acá se silencia y se comprueba que se llamó.
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  describe("login", () => {
    test("si guardar auth.session falla, no queda la sesión iniciada", async () => {
      await getUsers(storage); // el usuario semilla se guarda antes de romper el storage
      failOnSet(SESSION_KEY);
      const store = createStore();

      const ok = await store.login(DEMO_EMAIL, DEMO_PASSWORD);

      expect(ok).toBe(false);
      expect(store.currentUser).toBeNull();
      expect(store.isAuthenticated).toBe(false);
      expect(store.loginError).toBe(AUTH_MESSAGES.loginFailed);
      expect(store.isLoading).toBe(false);
      expect(readSessionRaw()).toBeNull();
      expect(createStore().isAuthenticated).toBe(false);
    });

    test("si verifyCredentials lanza: mensaje genérico, isLoading en false y sin sesión", async () => {
      failOnGet(USERS_KEY);
      const store = createStore();

      const pending = store.login(DEMO_EMAIL, DEMO_PASSWORD);
      expect(store.isLoading).toBe(true);
      const ok = await pending;

      expect(ok).toBe(false);
      expect(store.loginError).toBe("No pudimos procesar el ingreso. Probá de nuevo.");
      expect(store.loginError).toBe(AUTH_MESSAGES.loginFailed);
      expect(store.isLoading).toBe(false);
      expect(store.currentUser).toBeNull();
      expect(consoleError).toHaveBeenCalled();
    });

    test("después de una falla no queda trabado: se puede volver a intentar", async () => {
      const original = storage.getItem.bind(storage);
      failOnGet(USERS_KEY);
      const store = createStore();
      expect(await store.login(DEMO_EMAIL, DEMO_PASSWORD)).toBe(false);

      storage.getItem = original; // el storage vuelve a responder

      expect(await store.login(DEMO_EMAIL, DEMO_PASSWORD)).toBe(true);
      expect(store.loginError).toBeNull();
      expect(store.currentUser).toEqual({ email: DEMO_EMAIL });
    });

    test("clearError oculta el mensaje genérico", async () => {
      failOnGet(USERS_KEY);
      const store = createStore();
      await store.login(DEMO_EMAIL, DEMO_PASSWORD);

      store.clearError();

      expect(store.loginError).toBeNull();
    });
  });

  // Mensaje genérico del registro ante un error inesperado (D17, ver el `catch` de `register`).
  describe("register › falla inesperada", () => {
    test("si addUser lanza: mensaje genérico, isLoading en false y sin sesión", async () => {
      failOnGet(USERS_KEY);
      const store = createStore();

      const pending = store.register("nueva@demo.com", "clave-nueva-123");
      expect(store.isLoading).toBe(true);
      const ok = await pending;

      expect(ok).toBe(false);
      expect(store.registerError).toBe("No pudimos completar el registro. Probá de nuevo.");
      expect(store.registerError).toBe(AUTH_MESSAGES.registerFailed);
      expect(store.loginError).toBeNull();
      expect(store.isLoading).toBe(false);
      expect(store.currentUser).toBeNull();
      expect(readSessionRaw()).toBeNull();
      expect(consoleError).toHaveBeenCalled();
    });

    test("si guardar auth.session falla, no queda la sesión iniciada", async () => {
      failOnSet(SESSION_KEY);
      const store = createStore();

      const ok = await store.register("nueva@demo.com", "clave-nueva-123");

      expect(ok).toBe(false);
      expect(store.registerError).toBe(AUTH_MESSAGES.registerFailed);
      expect(store.currentUser).toBeNull();
      expect(store.isLoading).toBe(false);
      expect(readSessionRaw()).toBeNull();
    });

    test("después de una falla no queda trabado: se puede volver a intentar", async () => {
      const original = storage.getItem.bind(storage);
      failOnGet(USERS_KEY);
      const store = createStore();
      expect(await store.register("nueva@demo.com", "clave-nueva-123")).toBe(false);

      storage.getItem = original;

      expect(await store.register("nueva@demo.com", "clave-nueva-123")).toBe(true);
      expect(store.registerError).toBeNull();
      expect(store.currentUser).toEqual({ email: "nueva@demo.com" });
    });
  });
});
