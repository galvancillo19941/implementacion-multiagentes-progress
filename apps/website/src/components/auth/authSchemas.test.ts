import { describe, expect, test } from "vite-plus/test";
import { AUTH_MESSAGES, PASSWORD_MIN_LENGTH, loginSchema, registerSchema } from "./authSchemas.ts";

/** Todos los mensajes de error agrupados por campo (para ver también que no salgan de más). */
function errorsByField(result: {
  success: boolean;
  error?: { issues: { path: PropertyKey[]; message: string }[] };
}): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of result.error?.issues ?? []) {
    const field = String(issue.path[0]);
    (errors[field] ??= []).push(issue.message);
  }
  return errors;
}

const VALID_PASSWORD = "clave1234";

describe("mensajes", () => {
  test("el mínimo de la contraseña sale de PASSWORD_MIN_LENGTH", () => {
    expect(PASSWORD_MIN_LENGTH).toBe(8);
    expect(AUTH_MESSAGES.passwordMin).toBe(
      `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
    );
    expect(AUTH_MESSAGES.passwordMin).toBe("La contraseña debe tener al menos 8 caracteres");
  });

  test("textos en voseo de los errores generales del login y del registro", () => {
    expect(AUTH_MESSAGES.invalidCredentials).toBe("Email o contraseña incorrectos");
    expect(AUTH_MESSAGES.emailTaken).toBe("Ya existe una cuenta con ese email");
    expect(AUTH_MESSAGES.loginFailed).toBe("No pudimos procesar el ingreso. Probá de nuevo.");
    expect(AUTH_MESSAGES.registerFailed).toBe("No pudimos completar el registro. Probá de nuevo.");
  });
});

describe("loginSchema", () => {
  test("datos correctos pasan", () => {
    const result = loginSchema.safeParse({ email: "ana@mail.com", password: "x" });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ email: "ana@mail.com", password: "x" });
  });

  test("campos vacíos: un solo error por campo", () => {
    const result = loginSchema.safeParse({ email: "", password: "" });
    expect(result.success).toBe(false);
    expect(errorsByField(result)).toEqual({
      email: [AUTH_MESSAGES.emailRequired],
      password: [AUTH_MESSAGES.passwordRequired],
    });
  });

  test("un email con solo espacios cuenta como vacío", () => {
    const result = loginSchema.safeParse({ email: "   ", password: "x" });
    expect(errorsByField(result)).toEqual({ email: ["El email es obligatorio"] });
  });

  test.each(["hola@", "hola", "@mail.com", "hola@mail", "ho la@mail.com"])(
    "email inválido (%s): 'Ingresá un email válido'",
    (email) => {
      const result = loginSchema.safeParse({ email, password: "x" });
      expect(errorsByField(result)).toEqual({ email: ["Ingresá un email válido"] });
    },
  );

  test("el email con espacios y mayúsculas se normaliza", () => {
    const result = loginSchema.safeParse({ email: "  Ana@Mail.COM ", password: "x" });
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("ana@mail.com");
  });

  test("la contraseña no se recorta ni se le exige mínimo en el login", () => {
    const result = loginSchema.safeParse({ email: "ana@mail.com", password: " a " });
    expect(result.data?.password).toBe(" a ");
  });

  test("una contraseña con solo espacios no cuenta como vacía", () => {
    expect(loginSchema.safeParse({ email: "ana@mail.com", password: " " }).success).toBe(true);
  });

  test("campos que faltan o no son texto dan el error de obligatorio", () => {
    expect(errorsByField(loginSchema.safeParse({}))).toEqual({
      email: [AUTH_MESSAGES.emailRequired],
      password: [AUTH_MESSAGES.passwordRequired],
    });
  });
});

describe("registerSchema", () => {
  const valid = {
    email: "ana@mail.com",
    password: VALID_PASSWORD,
    confirmPassword: VALID_PASSWORD,
  };

  test("datos correctos pasan, con el email normalizado", () => {
    const result = registerSchema.safeParse({ ...valid, email: " ANA@mail.com  " });
    expect(result.success).toBe(true);
    expect(result.data).toEqual(valid);
  });

  test("campos vacíos: un solo error por campo, sin 'no coinciden'", () => {
    const result = registerSchema.safeParse({ email: "", password: "", confirmPassword: "" });
    expect(errorsByField(result)).toEqual({
      email: [AUTH_MESSAGES.emailRequired],
      password: [AUTH_MESSAGES.passwordRequired],
      confirmPassword: [AUTH_MESSAGES.confirmPasswordRequired],
    });
  });

  test("un email con solo espacios cuenta como vacío", () => {
    const result = registerSchema.safeParse({ ...valid, email: " " });
    expect(errorsByField(result)).toEqual({ email: [AUTH_MESSAGES.emailRequired] });
  });

  test("email inválido (hola@): 'Ingresá un email válido'", () => {
    const result = registerSchema.safeParse({ ...valid, email: "hola@" });
    expect(errorsByField(result)).toEqual({ email: [AUTH_MESSAGES.emailInvalid] });
  });

  test(`contraseña de menos de ${PASSWORD_MIN_LENGTH} caracteres`, () => {
    const short = "a".repeat(PASSWORD_MIN_LENGTH - 1);
    const result = registerSchema.safeParse({ ...valid, password: short, confirmPassword: short });
    expect(errorsByField(result)).toEqual({ password: [AUTH_MESSAGES.passwordMin] });
  });

  test(`contraseña de exactamente ${PASSWORD_MIN_LENGTH} caracteres pasa`, () => {
    const exact = "a".repeat(PASSWORD_MIN_LENGTH);
    const result = registerSchema.safeParse({ ...valid, password: exact, confirmPassword: exact });
    expect(result.success).toBe(true);
  });

  test("contraseña vacía: solo 'obligatoria' (no también la del mínimo)", () => {
    const result = registerSchema.safeParse({ ...valid, password: "" });
    expect(errorsByField(result)).toEqual({ password: [AUTH_MESSAGES.passwordRequired] });
  });

  test("confirmación vacía: 'Confirmá tu contraseña'", () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: "" });
    expect(errorsByField(result)).toEqual({ confirmPassword: ["Confirmá tu contraseña"] });
  });

  test("contraseñas que no coinciden: 'Las contraseñas no coinciden' en la confirmación", () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: "clave9999" });
    expect(errorsByField(result)).toEqual({
      confirmPassword: ["Las contraseñas no coinciden"],
    });
  });

  test("las contraseñas distinguen mayúsculas y espacios al comparar", () => {
    expect(
      errorsByField(registerSchema.safeParse({ ...valid, confirmPassword: "CLAVE1234" })),
    ).toEqual({ confirmPassword: [AUTH_MESSAGES.passwordsMismatch] });
    expect(
      errorsByField(registerSchema.safeParse({ ...valid, confirmPassword: `${VALID_PASSWORD} ` })),
    ).toEqual({ confirmPassword: [AUTH_MESSAGES.passwordsMismatch] });
  });

  test("'no coinciden' sale aunque fallen el email o el largo de la contraseña", () => {
    const result = registerSchema.safeParse({
      email: "hola@",
      password: "corta",
      confirmPassword: "otra",
    });
    expect(errorsByField(result)).toEqual({
      email: [AUTH_MESSAGES.emailInvalid],
      password: [AUTH_MESSAGES.passwordMin],
      confirmPassword: [AUTH_MESSAGES.passwordsMismatch],
    });
  });
});
