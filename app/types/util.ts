/**
 * Emulate nominal types by creating a type that is "branded"
 *
 * @example
 * type EvenNumber = Brand<number, "EvenNumber">
 * const two: EvenNumber = 2 as EvenNumber
 */
export type Brand<K, T> = K & { __brand: T }
