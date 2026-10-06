import { nextTick, reactive, readonly, ref, watch, type ComponentPublicInstance } from "vue";
import type { z } from "zod";

/**
 * Lógica compartida de los formularios validados con un esquema de Zod (D13).
 *
 * - `form`: valores de los campos (todos arrancan en "").
 * - `errors`: error por campo ("" si no hay). Se llena con el primer mensaje del esquema por campo.
 * - Al editar un campo se borra su error y se llama a `onEdit` (para borrar errores relacionados
 *   o un mensaje general).
 * - `submit`: valida; si falla, muestra los errores y lleva el foco al primer campo con error
 *   (en el orden de `fields`); si pasa, llama a `onSubmit` con los datos ya transformados por
 *   el esquema. Mientras corre, `isSubmitting` es `true` y un segundo envío se ignora.
 * - `fieldRef(campo)`: va en `:ref` del `FormField` (o de cualquier elemento con `focus()`) para
 *   que el foco pueda llegar a ese campo.
 */

interface Focusable {
  focus: () => void;
}

function isFocusable(value: unknown): value is Focusable {
  return (
    typeof value === "object" &&
    value !== null &&
    "focus" in value &&
    typeof (value as Focusable).focus === "function"
  );
}

export interface SchemaFormOptions<F extends string, T> {
  /** Esquema que recibe un objeto con un string por campo. */
  schema: z.ZodType<T, Record<NoInfer<F>, string>>;
  /** Campos en el orden en que aparecen en pantalla (define a cuál va el foco). */
  fields: readonly F[];
  /** Se llama solo con datos válidos. */
  onSubmit: (data: T) => void | Promise<void>;
  /** Se llama después de borrar el error del campo editado. */
  onEdit?: (field: F, errors: Record<F, string>) => void;
}

type FieldRef = (el: Element | ComponentPublicInstance | null) => void;

export function useSchemaForm<F extends string, T>(options: SchemaFormOptions<F, T>) {
  const { schema, fields, onSubmit, onEdit } = options;

  const emptyValues = () =>
    Object.fromEntries(fields.map((field) => [field, ""])) as Record<F, string>;

  const form = reactive(emptyValues()) as Record<F, string>;
  const errors = reactive(emptyValues()) as Record<F, string>;
  const isSubmitting = ref(false);

  const focusTargets = new Map<F, Focusable>();
  const refSetters = new Map<F, FieldRef>();

  /** Devuelve siempre la misma función por campo, así Vue no la reasigna en cada render. */
  function fieldRef(field: F): FieldRef {
    let setter = refSetters.get(field);
    if (!setter) {
      setter = (el) => {
        if (isFocusable(el)) focusTargets.set(field, el);
        else focusTargets.delete(field);
      };
      refSetters.set(field, setter);
    }
    return setter;
  }

  function isField(value: unknown): value is F {
    return fields.includes(value as F);
  }

  function clearErrors() {
    for (const field of fields) errors[field] = "";
  }

  // Al editar un campo, su error desaparece.
  for (const field of fields) {
    watch(
      () => form[field],
      () => {
        errors[field] = "";
        onEdit?.(field, errors);
      },
    );
  }

  async function submit(): Promise<void> {
    if (isSubmitting.value) return;
    isSubmitting.value = true;

    try {
      clearErrors();
      const result = schema.safeParse({ ...form });

      if (!result.success) {
        for (const issue of result.error.issues) {
          const field = issue.path[0];
          if (isField(field) && errors[field] === "") errors[field] = issue.message;
        }
        const firstInvalid = fields.find((field) => errors[field] !== "");
        if (firstInvalid) {
          await nextTick();
          focusTargets.get(firstInvalid)?.focus();
        }
        return;
      }

      await onSubmit(result.data);
    } finally {
      isSubmitting.value = false;
    }
  }

  return { form, errors, isSubmitting: readonly(isSubmitting), submit, fieldRef };
}
