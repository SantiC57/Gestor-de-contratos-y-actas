import { z } from "zod";

/**
 * Schema de validación para inicio de sesión
 * - Usuario: mínimo 3 caracteres, sin espacios
 * - Contraseña: mínimo 4 caracteres
 */
export const loginSchema = z.object({
  usuario: z
    .string()
    .min(3, { error: "El usuario debe tener al menos 3 caracteres" })
    .max(50, { error: "El usuario no puede exceder 50 caracteres" })
    .refine(val => !val.includes(" "), {
      error: "El usuario no puede contener espacios",
    }),
  contrasena: z
    .string()
    .min(4, { error: "La contraseña debe tener al menos 4 caracteres" })
    .max(100, { error: "La contraseña no puede exceder 100 caracteres" }),
});

/**
 * Schema de validación para registro de usuario
 * - Usuario: 3-50 caracteres, sin espacios ni caracteres especiales
 * - Email: formato válido (opcional, para futuro uso)
 * - Contraseña: mínimo 4 caracteres
 */
export const registroSchema = z
  .object({
    usuario: z
      .string()
      .min(3, { error: "El usuario debe tener al menos 3 caracteres" })
      .max(50, { error: "El usuario no puede exceder 50 caracteres" })
      .refine(val => !val.includes(" "), {
        error: "El usuario no puede contener espacios",
      })
      .refine(val => /^[a-zA-Z0-9_]+$/.test(val), {
        error: "El usuario solo puede contener letras, números y guiones bajos",
      }),
    contrasena: z
      .string()
      .min(4, { error: "La contraseña debe tener al menos 4 caracteres" })
      .max(100, { error: "La contraseña no puede exceder 100 caracteres" }),
    confirmarContrasena: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.contrasena !== data.confirmarContrasena) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Las contraseñas no coinciden",
        path: ["confirmarContrasena"],
      });
    }
  });

/**
 * Schema para cambio de contraseña
 */
export const cambioContrasenaSchema = z
  .object({
    contrasenaActual: z
      .string()
      .min(1, { error: "Ingrese la contraseña actual" }),
    nuevaContrasena: z
      .string()
      .min(4, { error: "La nueva contraseña debe tener al menos 4 caracteres" })
      .max(100, { error: "La contraseña no puede exceder 100 caracteres" }),
    confirmarNuevaContrasena: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.nuevaContrasena !== data.confirmarNuevaContrasena) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Las contraseñas no coinciden",
        path: ["confirmarNuevaContrasena"],
      });
    }
  });

/**
 * Tipos inferidos de los schemas
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type RegistroInput = z.infer<typeof registroSchema>;
export type CambioContrasenaInput = z.infer<typeof cambioContrasenaSchema>;

/**
 * Función helper para validar datos de login
 * Retorna el objeto validado o null si hay errores
 */
export function validarLogin(data: unknown): LoginInput | null {
  const result = loginSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  return null;
}

/**
 * Función helper para obtener errores de validación de login
 */
export function obtenerErroresLogin(data: unknown): Record<string, string> {
  const result = loginSchema.safeParse(data);
  if (result.success) {
    return {};
  }

  const errores: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path[0];
    if (typeof path === "string") {
      errores[path] = issue.message;
    }
  }
  return errores;
}
