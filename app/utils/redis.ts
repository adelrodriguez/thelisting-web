import type { RedisKey } from "~/config/consts"

export function generateKey(key: RedisKey, ...args: string[]): string {
  return [key, ...args].join(":")
}
