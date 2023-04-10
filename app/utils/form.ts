import type { z } from "zod"

export function flattenErrors<T>(error: z.ZodError<T>) {
  return error.flatten().fieldErrors
}
