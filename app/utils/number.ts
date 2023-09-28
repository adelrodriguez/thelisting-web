export function round(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100
}

export function isNumber(value: unknown): value is number {
  if (typeof value === "string") return !isNaN(Number(value))

  if (typeof value === "number") return !isNaN(value)

  return false
}
