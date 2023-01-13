export function generateKey(key: string, ...args: string[]): string {
  return [key, ...args].join(":")
}
