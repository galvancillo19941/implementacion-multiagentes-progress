/**
 * Hash de contraseñas para el prototipo que guarda los usuarios en el navegador.
 * SHA-256 (vía `crypto.subtle`) sobre `sal + contraseña`, con una sal aleatoria por usuario
 * (vía `crypto.getRandomValues`). Sal y hash se guardan en hexadecimal.
 */

const SALT_BYTES = 16;

export interface PasswordHash {
  passwordHash: string;
  salt: string;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Sal aleatoria nueva (16 bytes en hexadecimal). */
export function generateSalt(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(SALT_BYTES)));
}

/** SHA-256 de `sal + contraseña`, en hexadecimal. */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(salt + password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(new Uint8Array(digest));
}

/** Genera una sal nueva y el hash de la contraseña con esa sal. */
export async function createPasswordHash(password: string): Promise<PasswordHash> {
  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  return { passwordHash, salt };
}

/** Hashea la contraseña ingresada con la sal guardada y la compara con el hash guardado. */
export async function verifyPassword(
  password: string,
  passwordHash: string,
  salt: string,
): Promise<boolean> {
  const candidate = await hashPassword(password, salt);
  return candidate === passwordHash;
}
