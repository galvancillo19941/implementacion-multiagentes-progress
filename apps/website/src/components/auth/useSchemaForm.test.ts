import { describe, expect, test, vi } from "vite-plus/test";
import { nextTick } from "vue";
import { AUTH_MESSAGES, loginSchema, registerSchema } from "./authSchemas.ts";
import { useSchemaForm } from "./useSchemaForm.ts";

const LOGIN_FIELDS = ["email", "password"] as const;
const REGISTER_FIELDS = ["email", "password", "confirmPassword"] as const;

/**
 * Carga valores como lo haría el usuario: los cambios de cada campo (que borran su error) se
 * procesan antes del envío, igual que en pantalla.
 */
async function fill<F extends string>(form: Record<F, string>, values: Partial<Record<F, string>>) {
  Object.assign(form, values);
  await nextTick();
}

/** Formulario de login con "campos" falsos que registran si recibieron el foco. */
function createLoginForm(onSubmit = vi.fn()) {
  const form = useSchemaForm({ schema: loginSchema, fields: LOGIN_FIELDS, onSubmit });
  const focus = { email: vi.fn(), password: vi.fn() };
  form.fieldRef("email")({ focus: focus.email } as unknown as Element);
  form.fieldRef("password")({ focus: focus.password } as unknown as Element);
  return { ...form, focus, onSubmit };
}

describe("useSchemaForm", () => {
  test("campos vacíos: muestra el error de cada campo y no envía", async () => {
    const { errors, submit, onSubmit, focus } = createLoginForm();

    await submit();

    expect(errors.email).toBe(AUTH_MESSAGES.emailRequired);
    expect(errors.password).toBe(AUTH_MESSAGES.passwordRequired);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(focus.email).toHaveBeenCalledTimes(1);
    expect(focus.password).not.toHaveBeenCalled();
  });

  test("email inválido: error en el email, foco ahí y no envía", async () => {
    const { form, errors, submit, onSubmit, focus } = createLoginForm();
    await fill(form, { email: "hola@", password: "x" });

    await submit();

    expect(errors.email).toBe(AUTH_MESSAGES.emailInvalid);
    expect(errors.password).toBe("");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(focus.email).toHaveBeenCalled();
  });

  test("el foco va al primer campo con error en el orden de la pantalla", async () => {
    const { form, submit, focus } = createLoginForm();
    await fill(form, { email: "ana@mail.com" });

    await submit();

    expect(focus.password).toHaveBeenCalledTimes(1);
    expect(focus.email).not.toHaveBeenCalled();
  });

  test("datos válidos: envía una vez, con el email ya normalizado", async () => {
    const { form, errors, submit, onSubmit } = createLoginForm();
    await fill(form, { email: "  Ana@Mail.com ", password: "clave" });

    await submit();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ email: "ana@mail.com", password: "clave" });
    expect(errors).toEqual({ email: "", password: "" });
  });

  test("al editar un campo se borra su error (y solo el suyo)", async () => {
    const { form, errors, submit } = createLoginForm();
    await submit();
    expect(errors.email).not.toBe("");

    await fill(form, { email: "a" });

    expect(errors.email).toBe("");
    expect(errors.password).toBe(AUTH_MESSAGES.passwordRequired);
  });

  test("sin doble envío: mientras procesa, un segundo envío se ignora", async () => {
    let finish = () => {};
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const { form, submit, isSubmitting } = createLoginForm(onSubmit);
    await fill(form, { email: "ana@mail.com", password: "clave" });

    const first = submit();
    expect(isSubmitting.value).toBe(true);
    await submit();
    finish();
    await first;

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(isSubmitting.value).toBe(false);
  });

  test("si el envío falla, isSubmitting vuelve a false y se puede reenviar", async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(new Error("falla"))
      .mockResolvedValueOnce(undefined);
    const { form, submit, isSubmitting } = createLoginForm(onSubmit);
    await fill(form, { email: "ana@mail.com", password: "clave" });

    await expect(submit()).rejects.toThrow("falla");
    expect(isSubmitting.value).toBe(false);

    await submit();
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  test("registro: contraseñas que no coinciden no envían", async () => {
    const onSubmit = vi.fn();
    const { form, errors, submit } = useSchemaForm({
      schema: registerSchema,
      fields: REGISTER_FIELDS,
      onSubmit,
    });
    await fill(form, {
      email: "ana@mail.com",
      password: "clave1234",
      confirmPassword: "clave9999",
    });

    await submit();

    expect(errors.confirmPassword).toBe(AUTH_MESSAGES.passwordsMismatch);
    expect(errors.email).toBe("");
    expect(errors.password).toBe("");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("onEdit recibe el campo editado y puede borrar errores relacionados", async () => {
    const onEdit = vi.fn((field: string, fieldErrors: Record<string, string>) => {
      if (field === "password") fieldErrors.confirmPassword = "";
    });
    const { form, errors, submit } = useSchemaForm({
      schema: registerSchema,
      fields: REGISTER_FIELDS,
      onSubmit: vi.fn(),
      onEdit,
    });
    await fill(form, {
      email: "ana@mail.com",
      password: "clave1234",
      confirmPassword: "clave9999",
    });
    onEdit.mockClear();
    await submit();
    expect(errors.confirmPassword).toBe(AUTH_MESSAGES.passwordsMismatch);

    await fill(form, { password: "clave9999" });

    expect(onEdit).toHaveBeenCalledWith("password", errors);
    expect(errors.confirmPassword).toBe("");
  });
});
