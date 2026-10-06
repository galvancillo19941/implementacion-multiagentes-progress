import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { z } from "zod";
import { AUTH_MESSAGES } from "./authSchemas.ts";
import {
  SESSION_KEY,
  addUser,
  normalizeEmail,
  userExists,
  verifyCredentials,
  type PublicUser,
} from "./userStorage.ts";

/**
 * Sesión del usuario (Pinia). Prototipo: todo queda en el navegador (ver `userStorage.ts`).
 *
 * - `currentUser` guarda solo `{ email }`: nunca contraseña, hash ni sal.
 * - La sesión se persiste en `auth.session` (solo el email) y se restaura al crear el store,
 *   o sea al cargar la app, solo si ese email existe en `auth.users`.
 * - Los mensajes de error salen de `AUTH_MESSAGES` (`authSchemas.ts`).
 * - El `Storage` es opcional (por defecto `window.localStorage`, tomado recién al usarse) para
 *   poder probar el store sin navegador: ver `defineAuthStore`.
 */

/** Forma de `auth.session`. Las claves de más se descartan (`z.object` las quita). */
const sessionSchema = z.object({ email: z.string().min(1) });

/**
 * Lee `auth.session` sin lanzar errores: si no existe, el JSON está roto, no tiene la forma
 * esperada, el email no existe en `auth.users` o el storage no está disponible, devuelve `null`
 * (sin sesión). Es sincrónica (el guard del router la usa sin esperar): la existencia del email se
 * comprueba con `userExists`, que cuenta al usuario semilla aunque todavía no se haya guardado.
 */
function readSession(getStorage: () => Storage): PublicUser | null {
  try {
    const storage = getStorage();
    const raw = storage.getItem(SESSION_KEY);
    if (raw === null) return null;
    const result = sessionSchema.safeParse(JSON.parse(raw));
    if (!result.success) return null;
    const email = normalizeEmail(result.data.email);
    return userExists(email, storage) ? { email } : null;
  } catch {
    return null;
  }
}

/**
 * Crea la definición del store usando el `Storage` indicado (por defecto `window.localStorage`).
 * La app usa `useAuthStore`; las pruebas llaman a `defineAuthStore(storageEnMemoria)`.
 */
export function defineAuthStore(storage?: Storage) {
  const getStorage = (): Storage => storage ?? window.localStorage;

  return defineStore("auth", () => {
    const currentUser = ref<PublicUser | null>(readSession(getStorage));
    const isLoading = ref(false);
    const loginError = ref<string | null>(null);
    const registerError = ref<string | null>(null);

    const isAuthenticated = computed(() => currentUser.value !== null);

    /**
     * Inicia la sesión con solo el email: primero la guarda en `auth.session` y recién después la
     * marca en el estado. Si el guardado falla, lanza sin dejar la sesión iniciada.
     */
    function startSession(user: PublicUser): void {
      getStorage().setItem(SESSION_KEY, JSON.stringify({ email: user.email }));
      currentUser.value = { email: user.email };
    }

    /**
     * Verifica las credenciales con `userStorage`. Si son correctas guarda la sesión y devuelve
     * `true`; si no, deja `loginError` con "Email o contraseña incorrectos" y devuelve `false`.
     * Si algo falla de forma inesperada (al verificar o al guardar la sesión), deja `loginError`
     * con un mensaje genérico, no inicia sesión y devuelve `false`.
     * Mientras se procesa, `isLoading` es `true`; una segunda llamada en ese lapso se ignora
     * (devuelve `false` sin tocar el estado).
     */
    async function login(email: string, password: string): Promise<boolean> {
      if (isLoading.value) return false;
      isLoading.value = true;
      loginError.value = null;

      try {
        const user = await verifyCredentials(email, password, getStorage());
        if (!user) {
          loginError.value = AUTH_MESSAGES.invalidCredentials;
          return false;
        }
        // Solo el email: `verifyCredentials` ya devuelve el usuario sin hash ni sal.
        startSession(user);
        return true;
      } catch (error) {
        console.error("Falló el ingreso:", error);
        loginError.value = AUTH_MESSAGES.loginFailed;
        return false;
      } finally {
        isLoading.value = false;
      }
    }

    /**
     * Crea el usuario con `userStorage.addUser` (guarda solo hash + sal) y, si sale bien, inicia
     * la sesión automáticamente y devuelve `true`. Si el email ya está registrado (sin distinguir
     * mayúsculas ni espacios), deja `registerError` con "Ya existe una cuenta con ese email",
     * no toca la sesión y devuelve `false`. Si algo falla de forma inesperada, deja `registerError`
     * con un mensaje genérico y devuelve `false` (ver el `catch`).
     * Mismo manejo de `isLoading` y del doble envío que `login`.
     */
    async function register(email: string, password: string): Promise<boolean> {
      if (isLoading.value) return false;
      isLoading.value = true;
      registerError.value = null;

      try {
        const user = await addUser(email, password, getStorage());
        if (!user) {
          registerError.value = AUTH_MESSAGES.emailTaken;
          return false;
        }
        // Solo el email: `addUser` ya devuelve el usuario sin hash ni sal.
        startSession(user);
        return true;
      } catch (error) {
        // Mensaje genérico si el registro falla de forma inesperada (D17): cubre también el caso en
        // que la cuenta se creó pero no se pudo guardar la sesión.
        console.error("Falló el registro:", error);
        registerError.value = AUTH_MESSAGES.registerFailed;
        return false;
      } finally {
        isLoading.value = false;
      }
    }

    /** Cierra la sesión: limpia el estado y borra `auth.session`. */
    function logout(): void {
      currentUser.value = null;
      loginError.value = null;
      registerError.value = null;
      getStorage().removeItem(SESSION_KEY);
    }

    /**
     * Oculta los errores de login y de registro (por ejemplo, cuando el usuario vuelve a editar
     * el formulario o entra a la pantalla).
     */
    function clearError(): void {
      loginError.value = null;
      registerError.value = null;
    }

    return {
      currentUser,
      isLoading,
      loginError,
      registerError,
      isAuthenticated,
      login,
      register,
      logout,
      clearError,
    };
  });
}

/** Store de sesión de la app (usa `window.localStorage`). */
export const useAuthStore = defineAuthStore();
