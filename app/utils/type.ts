/**
 * Get the type of the elements of an array
 */
export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never

/**
 * Join an array of strings with a separator
 */
export type Join<T extends string[], S extends string> = T extends []
  ? ""
  : T extends [infer F, ...infer R]
    ? F extends string
      ? `${F}${R extends [] ? "" : S}${Join<Extract<R, string[]>, S>}`
      : ""
    : ""

/**
 * Make null and undefined values to the type
 */
export type Nullish<T> = T | null | undefined
