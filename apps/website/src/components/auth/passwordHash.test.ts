import { describe, expect, test } from "vite-plus/test";
import { createPasswordHash, generateSalt, hashPassword, verifyPassword } from "./passwordHash.ts";

describe("passwordHash", () => {
  test("genera sales aleatorias de 16 bytes en hexadecimal", () => {
    const a = generateSalt();
    const b = generateSalt();
    expect(a).toMatch(/^[0-9a-f]{32}$/);
    expect(b).toMatch(/^[0-9a-f]{32}$/);
    expect(a).not.toBe(b);
  });

  test("el hash es SHA-256 en hexadecimal y no contiene la contraseña", async () => {
    const hash = await hashPassword("secreta123", "abc");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain("secreta123");
  });

  test("misma contraseña y misma sal dan el mismo hash", async () => {
    expect(await hashPassword("secreta123", "abc")).toBe(await hashPassword("secreta123", "abc"));
  });

  test("misma contraseña con distinta sal da distinto hash", async () => {
    const first = await createPasswordHash("secreta123");
    const second = await createPasswordHash("secreta123");
    expect(first.salt).not.toBe(second.salt);
    expect(first.passwordHash).not.toBe(second.passwordHash);
  });

  test("verifyPassword acepta la contraseña correcta", async () => {
    const { passwordHash, salt } = await createPasswordHash("secreta123");
    expect(await verifyPassword("secreta123", passwordHash, salt)).toBe(true);
  });

  test("verifyPassword rechaza una contraseña incorrecta o con otra sal", async () => {
    const { passwordHash, salt } = await createPasswordHash("secreta123");
    expect(await verifyPassword("Secreta123", passwordHash, salt)).toBe(false);
    expect(await verifyPassword("secreta123 ", passwordHash, salt)).toBe(false);
    expect(await verifyPassword("secreta123", passwordHash, generateSalt())).toBe(false);
  });
});
