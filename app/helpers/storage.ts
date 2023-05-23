import SuperJSON from "superjson"
import invariant from "tiny-invariant"

import { isWindowDefined } from "~/utils/window"

/**
 * Storage is a wrapper around the Storage Web API.
 */
export default class Storage {
  private storage: globalThis.Storage

  constructor(storage: "local" | "session") {
    invariant(!isWindowDefined() || window, "No window object found")

    switch (storage) {
      case "local":
        invariant(!!window.localStorage, "No local storage found")
        this.storage = localStorage
        break
      case "session":
        invariant(!!window.sessionStorage, "No session storage found")
        this.storage = sessionStorage
        break
      default:
        throw new Error("Invalid storage type")
    }
  }

  set(key: string, data: unknown): void {
    const body = SuperJSON.stringify(data)

    this.storage.setItem(key, body)
  }

  get<T>(key: string): T | null {
    const item = this.storage.getItem(key)

    if (!item) {
      return null
    }

    return SuperJSON.parse<T>(item)
  }

  remove(key: string): void {
    this.storage.removeItem(key)
  }
}
