import { z } from "zod";
import { createPasswordHash, verifyPassword } from "./passwordHash.ts";

/**
 * Capa de almacenamiento de usuarios en localStorage (prototipo, todo queda en el navegador).
 * Nunca guarda la contraseña: solo `passwordHash` + `salt` (ver `passwordHash.ts`).
 * Todas las funciones reciben el `Storage` como parámetro opcional (por defecto `window.localStorage`,
 * que se toma recién al usarse, para que las pruebas corran sin navegador).
 */

export const USERS_KEY = "auth.users";
/** Clave de la sesión (solo el email). La usa el store de sesión (T1.9). */
export const SESSION_KEY = "auth.session";

const SEED_EMAIL = "demo@demo.com";
const SEED_PASSWORD = "demo1234";

const storedUserSchema = z.object({
  email: z.string(),
  passwordHash: z.string(),
  salt: z.string(),
});

/** Usuario tal como se guarda en `auth.users`. */
export type StoredUser = z.infer<typeof storedUserSchema>;

/** Usuario sin datos sensibles (sin hash ni sal). */
export interface PublicUser {
  email: string;
}

function resolveStorage(storage?: Storage): Storage {
  return storage ?? window.localStorage;
}

/** Recorta los espacios y pasa a minúsculas. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Compara el email guardado (normalizado acá, por si se cargó a mano con mayúsculas o espacios)
 * con un email ya normalizado.
 */
function hasEmail(user: StoredUser, normalizedEmail: string): boolean {
  return normalizeEmail(user.email) === normalizedEmail;
}

/**
 * Lee `auth.users` sin lanzar errores: si la clave no existe, el JSON está roto o no es una lista,
 * devuelve `[]`. Las entradas con forma inválida se descartan.
 */
function readUsers(storage: Storage): StoredUser[] {
  const raw = storage.getItem(USERS_KEY);
  if (raw === null) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((item) => {
    const result = storedUserSchema.safeParse(item);
    return result.success ? [result.data] : [];
  });
}

function writeUsers(storage: Storage, users: StoredUser[]): void {
  storage.setItem(USERS_KEY, JSON.stringify(users));
}

/** Si no hay ningún usuario, crea el usuario semilla `demo@demo.com` (guardado con hash). */
async function ensureSeedUser(storage: Storage): Promise<void> {
  if (readUsers(storage).length > 0) return;

  const { passwordHash, salt } = await createPasswordHash(SEED_PASSWORD);
  // Se vuelve a leer después del `await` por si otra llamada ya guardó usuarios mientras tanto.
  if (readUsers(storage).length > 0) return;
  writeUsers(storage, [{ email: SEED_EMAIL, passwordHash, salt }]);
}

/** Lista de usuarios guardados (con el usuario semilla si no había ninguno). */
export async function getUsers(storage?: Storage): Promise<StoredUser[]> {
  const target = resolveStorage(storage);
  await ensureSeedUser(target);
  return readUsers(target);
}

/**
 * Lectura sincrónica (no crea el usuario semilla): indica si existe un usuario con ese email,
 * sin distinguir mayúsculas ni espacios alrededor. Si todavía no hay ningún usuario guardado
 * (clave vacía, JSON roto o sin entradas válidas), cuenta como existente solo el usuario semilla,
 * que `getUsers` crea en cuanto se use. La usa el store al restaurar la sesión, que no puede esperar.
 * Puede lanzar si el storage no está disponible.
 */
export function userExists(email: string, storage?: Storage): boolean {
  const normalized = normalizeEmail(email);
  const users = readUsers(resolveStorage(storage));
  if (users.length === 0) return normalized === SEED_EMAIL;
  return users.some((user) => hasEmail(user, normalized));
}

/**
 * Busca un usuario por email (sin distinguir mayúsculas ni espacios alrededor, tanto en el email
 * pedido como en el guardado).
 */
export async function findUserByEmail(
  email: string,
  storage?: Storage,
): Promise<StoredUser | undefined> {
  const normalized = normalizeEmail(email);
  const users = await getUsers(storage);
  return users.find((user) => hasEmail(user, normalized));
}

/**
 * Crea un usuario guardando solo hash + sal. Devuelve el usuario sin datos sensibles,
 * o `null` si ya existe un usuario con ese email.
 */
export async function addUser(
  email: string,
  password: string,
  storage?: Storage,
): Promise<PublicUser | null> {
  const target = resolveStorage(storage);
  const normalized = normalizeEmail(email);
  await ensureSeedUser(target);
  if (readUsers(target).some((user) => hasEmail(user, normalized))) return null;

  const { passwordHash, salt } = await createPasswordHash(password);
  // Lectura, chequeo y escritura sin `await` en el medio: no se pisan dos altas simultáneas.
  const users = readUsers(target);
  if (users.some((user) => hasEmail(user, normalized))) return null;
  writeUsers(target, [...users, { email: normalized, passwordHash, salt }]);
  return { email: normalized };
}

/**
 * Verifica email y contraseña. Devuelve el usuario sin hash ni sal, o `null` si falla.
 * Email inexistente y contraseña incorrecta dan el mismo `null` (no se distingue cuál falló).
 */
export async function verifyCredentials(
  email: string,
  password: string,
  storage?: Storage,
): Promise<PublicUser | null> {
  const user = await findUserByEmail(email, storage);
  if (!user) return null;

  const ok = await verifyPassword(password, user.passwordHash, user.salt);
  return ok ? { email: normalizeEmail(user.email) } : null;
}
