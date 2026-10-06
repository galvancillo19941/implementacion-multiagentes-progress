import { z } from "zod";

/**
 * Esquemas de validación de los formularios de login y registro (Zod 4).
 * Textos en voseo rioplatense. Cada error queda en el `path` de su campo.
 */

export const PASSWORD_MIN_LENGTH = 8;

/**
 * Textos de los formularios de login y registro: errores de cada campo y mensajes generales
 * (arriba del formulario) que deja el store de sesión.
 */
export const AUTH_MESSAGES = {
  emailRequired: "El email es obligatorio",
  emailInvalid: "Ingresá un email válido",
  passwordRequired: "La contraseña es obligatoria",
  passwordMin: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
  confirmPasswordRequired: "Confirmá tu contraseña",
  passwordsMismatch: "Las contraseñas no coinciden",
  /** Login: mismo texto para email inexistente y contraseña incorrecta. */
  invalidCredentials: "Email o contraseña incorrectos",
  /** Login: falla inesperada al verificar o al guardar la sesión. */
  loginFailed: "No pudimos procesar el ingreso. Probá de nuevo.",
  /** Registro: el email ya está registrado. */
  emailTaken: "Ya existe una cuenta con ese email",
  /** Registro: falla inesperada al crear la cuenta o al guardar la sesión. */
  registerFailed: "No pudimos completar el registro. Probá de nuevo.",
} as const;

/**
 * Email: se recorta y pasa a minúsculas ("   " cuenta como vacío).
 * El formato se valida en un `pipe`, que solo corre si el paso anterior no tuvo errores:
 * con el email vacío sale únicamente "El email es obligatorio".
 */
const emailField = z
  .string({ error: AUTH_MESSAGES.emailRequired })
  .trim()
  .toLowerCase()
  .min(1, { error: AUTH_MESSAGES.emailRequired })
  .pipe(z.email({ error: AUTH_MESSAGES.emailInvalid }));

/** Contraseña obligatoria. No se recorta: los espacios forman parte de la contraseña. */
const requiredPassword = z
  .string({ error: AUTH_MESSAGES.passwordRequired })
  .min(1, { error: AUTH_MESSAGES.passwordRequired, abort: true });

export const loginSchema = z.object({
  email: emailField,
  password: requiredPassword,
});

/** Solo se usa para decidir si corre el chequeo de coincidencia (ver `registerSchema`). */
const passwordPairFilled = z.object({
  password: z.string().min(1),
  confirmPassword: z.string().min(1),
});

/**
 * Registro. El chequeo "Las contraseñas no coinciden" (en `confirmPassword`) corre siempre que
 * contraseña y confirmación estén cargadas, aunque falle el email o la contraseña sea corta.
 * Si alguna de las dos está vacía no corre: ese campo ya muestra su error de obligatorio.
 */
export const registerSchema = z
  .object({
    email: emailField,
    password: requiredPassword.min(PASSWORD_MIN_LENGTH, { error: AUTH_MESSAGES.passwordMin }),
    confirmPassword: z
      .string({ error: AUTH_MESSAGES.confirmPasswordRequired })
      .min(1, { error: AUTH_MESSAGES.confirmPasswordRequired }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: AUTH_MESSAGES.passwordsMismatch,
    path: ["confirmPassword"],
    when: (payload) => passwordPairFilled.safeParse(payload.value).success,
  });

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
