import { beforeEach, describe, expect, test } from "vite-plus/test";
import { createPasswordHash, verifyPassword } from "./passwordHash.ts";
import { MemoryStorage } from "./testStorage.ts";
import {
  SESSION_KEY,
  USERS_KEY,
  addUser,
  findUserByEmail,
  getUsers,
  userExists,
  verifyCredentials,
} from "./userStorage.ts";

let storage: MemoryStorage;

beforeEach(() => {
  storage = new MemoryStorage();
});

describe("claves", () => {
  test("usan el prefijo auth.", () => {
    expect(USERS_KEY).toBe("auth.users");
    expect(SESSION_KEY).toBe("auth.session");
  });
});

describe("usuario semilla", () => {
  test("con el storage vacío existe demo@demo.com", async () => {
    const users = await getUsers(storage);
    expect(users.map((user) => user.email)).toEqual(["demo@demo.com"]);
  });

  test("se puede verificar con demo@demo.com / demo1234", async () => {
    expect(await verifyCredentials("demo@demo.com", "demo1234", storage)).toEqual({
      email: "demo@demo.com",
    });
  });

  test("se guarda con hash y sal, sin la contraseña en claro", async () => {
    await getUsers(storage);
    const raw = storage.getItem(USERS_KEY) ?? "";
    expect(raw).not.toContain("demo1234");
    const [seed] = JSON.parse(raw);
    expect(Object.keys(seed).sort()).toEqual(["email", "passwordHash", "salt"]);
    expect(await verifyPassword("demo1234", seed.passwordHash, seed.salt)).toBe(true);
  });

  test("no se vuelve a crear si ya hay usuarios", async () => {
    await getUsers(storage);
    const before = storage.getItem(USERS_KEY);
    await getUsers(storage);
    expect(storage.getItem(USERS_KEY)).toBe(before);
  });

  test("no se crea si ya hay otros usuarios guardados", async () => {
    storage.setItem(
      USERS_KEY,
      JSON.stringify([{ email: "ana@mail.com", passwordHash: "x", salt: "y" }]),
    );
    const users = await getUsers(storage);
    expect(users.map((user) => user.email)).toEqual(["ana@mail.com"]);
  });
});

describe("clave vacía o JSON roto", () => {
  test("sin la clave no lanza error y trata la lista como vacía (queda el semilla)", async () => {
    await expect(getUsers(storage)).resolves.toHaveLength(1);
  });

  test("con JSON roto no lanza error y trata la lista como vacía", async () => {
    storage.setItem(USERS_KEY, "{esto no es json");
    const users = await getUsers(storage);
    expect(users.map((user) => user.email)).toEqual(["demo@demo.com"]);
    expect(await verifyCredentials("demo@demo.com", "demo1234", storage)).not.toBeNull();
  });

  test("con JSON válido que no es una lista no lanza error", async () => {
    storage.setItem(USERS_KEY, JSON.stringify({ email: "x" }));
    const users = await getUsers(storage);
    expect(users.map((user) => user.email)).toEqual(["demo@demo.com"]);
  });

  test("descarta entradas con forma inválida", async () => {
    storage.setItem(
      USERS_KEY,
      JSON.stringify([
        null,
        42,
        { email: "a@a.com" },
        { email: "ana@mail.com", passwordHash: "x", salt: "y" },
      ]),
    );
    const users = await getUsers(storage);
    expect(users.map((user) => user.email)).toEqual(["ana@mail.com"]);
  });
});

describe("addUser y findUserByEmail", () => {
  test("crea el usuario y lo devuelve sin hash ni sal", async () => {
    const created = await addUser("ana@mail.com", "secreta123", storage);
    expect(created).toEqual({ email: "ana@mail.com" });
    const found = await findUserByEmail("ana@mail.com", storage);
    expect(found?.email).toBe("ana@mail.com");
  });

  test("normaliza el email (mayúsculas y espacios) al guardar y al buscar", async () => {
    const created = await addUser("  Ana@Mail.COM ", "secreta123", storage);
    expect(created).toEqual({ email: "ana@mail.com" });
    expect((await findUserByEmail("ANA@mail.com  ", storage))?.email).toBe("ana@mail.com");
  });

  test("no crea un usuario con un email ya registrado (incluido el semilla)", async () => {
    await addUser("ana@mail.com", "secreta123", storage);
    expect(await addUser(" ANA@mail.com", "otra-clave", storage)).toBeNull();
    expect(await addUser("Demo@Demo.com", "otra-clave", storage)).toBeNull();
    const users = await getUsers(storage);
    expect(users.map((user) => user.email)).toEqual(["demo@demo.com", "ana@mail.com"]);
  });

  test("findUserByEmail con un email inexistente devuelve undefined", async () => {
    expect(await findUserByEmail("nadie@mail.com", storage)).toBeUndefined();
  });

  test("nada guardado en claro: solo email, hash y sal", async () => {
    await addUser("ana@mail.com", "secreta123", storage);
    const raw = storage.getItem(USERS_KEY) ?? "";
    expect(raw).not.toContain("secreta123");
    expect(raw).not.toContain("demo1234");
    for (const user of JSON.parse(raw)) {
      expect(Object.keys(user).sort()).toEqual(["email", "passwordHash", "salt"]);
    }
  });

  test("dos usuarios con la misma contraseña tienen distinta sal y distinto hash", async () => {
    await addUser("ana@mail.com", "misma-clave", storage);
    await addUser("beto@mail.com", "misma-clave", storage);
    const ana = await findUserByEmail("ana@mail.com", storage);
    const beto = await findUserByEmail("beto@mail.com", storage);
    expect(ana?.salt).not.toBe(beto?.salt);
    expect(ana?.passwordHash).not.toBe(beto?.passwordHash);
  });
});

describe("verifyCredentials", () => {
  beforeEach(async () => {
    await addUser("ana@mail.com", "secreta123", storage);
  });

  test("credenciales correctas devuelven el usuario sin contraseña, hash ni sal", async () => {
    const user = await verifyCredentials("ana@mail.com", "secreta123", storage);
    expect(user).toEqual({ email: "ana@mail.com" });
    expect(user).not.toHaveProperty("password");
    expect(user).not.toHaveProperty("passwordHash");
    expect(user).not.toHaveProperty("salt");
  });

  test("acepta el email con mayúsculas o espacios", async () => {
    expect(await verifyCredentials("  ANA@Mail.com ", "secreta123", storage)).toEqual({
      email: "ana@mail.com",
    });
  });

  test("contraseña incorrecta devuelve null", async () => {
    expect(await verifyCredentials("ana@mail.com", "incorrecta", storage)).toBeNull();
  });

  test("la contraseña distingue mayúsculas y sus espacios cuentan (no se recortan)", async () => {
    expect(await verifyCredentials("ana@mail.com", " secreta123", storage)).toBeNull();
    expect(await verifyCredentials("ana@mail.com", "SECRETA123", storage)).toBeNull();
  });

  test("email inexistente devuelve null", async () => {
    expect(await verifyCredentials("nadie@mail.com", "secreta123", storage)).toBeNull();
  });

  test("contraseña incorrecta y email inexistente dan el mismo resultado", async () => {
    const wrongPassword = await verifyCredentials("ana@mail.com", "incorrecta", storage);
    const unknownEmail = await verifyCredentials("nadie@mail.com", "incorrecta", storage);
    expect(wrongPassword).toBe(unknownEmail);
  });

  test("con JSON roto no lanza error y falla igual que un email inexistente", async () => {
    storage.setItem(USERS_KEY, "[{");
    await expect(verifyCredentials("ana@mail.com", "secreta123", storage)).resolves.toBeNull();
  });
});

/** Guarda a mano (sin pasar por `addUser`) un usuario con el email tal cual se indica. */
async function saveUserByHand(email: string, password: string): Promise<void> {
  const { passwordHash, salt } = await createPasswordHash(password);
  storage.setItem(USERS_KEY, JSON.stringify([{ email, passwordHash, salt }]));
}

describe("email guardado a mano con mayúsculas o espacios", () => {
  beforeEach(async () => {
    await saveUserByHand("  Ana@Mail.COM ", "secreta123");
  });

  test("findUserByEmail lo encuentra", async () => {
    expect(await findUserByEmail("ana@mail.com", storage)).toBeDefined();
    expect(await findUserByEmail(" ANA@mail.com", storage)).toBeDefined();
  });

  test("verifyCredentials lo acepta y devuelve el email normalizado", async () => {
    expect(await verifyCredentials("ana@mail.com", "secreta123", storage)).toEqual({
      email: "ana@mail.com",
    });
  });

  test("verifyCredentials con otra contraseña sigue devolviendo null", async () => {
    expect(await verifyCredentials("ana@mail.com", "incorrecta", storage)).toBeNull();
  });

  test("addUser no crea un duplicado", async () => {
    expect(await addUser("ana@mail.com", "otra-clave", storage)).toBeNull();
    expect(await getUsers(storage)).toHaveLength(1);
  });

  test("userExists lo encuentra", () => {
    expect(userExists("ana@mail.com", storage)).toBe(true);
  });
});

describe("userExists (lectura sincrónica)", () => {
  test("encuentra un usuario guardado, sin distinguir mayúsculas ni espacios", async () => {
    await addUser("ana@mail.com", "secreta123", storage);
    expect(userExists("ana@mail.com", storage)).toBe(true);
    expect(userExists("  ANA@Mail.com ", storage)).toBe(true);
    expect(userExists(" Demo@Demo.com", storage)).toBe(true);
  });

  test("un email que no está guardado no existe", async () => {
    await addUser("ana@mail.com", "secreta123", storage);
    expect(userExists("nadie@mail.com", storage)).toBe(false);
  });

  test("devuelve un booleano (no una promesa) y no escribe en el storage", () => {
    expect(userExists("demo@demo.com", storage)).toBe(true);
    expect(storage.getItem(USERS_KEY)).toBeNull();
  });

  test.each([
    ["sin la clave", null],
    ["con JSON roto", "{roto"],
    ["con una lista vacía", "[]"],
    ["sin entradas válidas", JSON.stringify([{ email: "ana@mail.com" }])],
  ])("%s, cuenta el usuario semilla (todavía no creado) y nada más", (_name, raw) => {
    if (raw !== null) storage.setItem(USERS_KEY, raw);
    expect(userExists("demo@demo.com", storage)).toBe(true);
    expect(userExists("DEMO@demo.com ", storage)).toBe(true);
    expect(userExists("ana@mail.com", storage)).toBe(false);
  });

  test("si ya hay otros usuarios y no está el semilla, el semilla no existe", () => {
    storage.setItem(
      USERS_KEY,
      JSON.stringify([{ email: "ana@mail.com", passwordHash: "x", salt: "y" }]),
    );
    expect(userExists("demo@demo.com", storage)).toBe(false);
  });

  test("coincide con lo que después devuelve getUsers", async () => {
    expect(userExists("demo@demo.com", storage)).toBe(true);
    const users = await getUsers(storage);
    expect(users.map((user) => user.email)).toEqual(["demo@demo.com"]);
  });
});
