import type { RedisKey } from "~/config/consts"
import { Join } from "~/utils/type"

type GenerateKeyType<R extends RedisKey, T extends string[]> = `${R}:${Join<
  T,
  ":"
>}`

export function generateKey<R extends RedisKey, T extends string[]>(
  key: R,
  ...args: T
): GenerateKeyType<R, T> {
  return `${key}:${args.join(":")}` as GenerateKeyType<R, T>
}
