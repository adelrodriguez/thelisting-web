import { BASE_URL } from "~/config/env.server"

export function buildUrl<T extends string>(path: T): `${typeof BASE_URL}/${T}` {
  return `${BASE_URL}/${path}`
}
