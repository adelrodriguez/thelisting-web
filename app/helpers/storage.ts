import SuperJSON from "superjson"

import { isWindowDefined } from "~/utils/window"

/**
 * Storage is a wrapper around the Storage Web API.
 */
export default class Storage {
  private storage: globalThis.Storage

  constructor(storage: "local" | "session") {
    if (!window) {
      throw new Error("No window object found")
    }

    if (storage === "session" && (!isWindowDefined() || !window.localStorage)) {
      throw new Error("No session storage found!")
    }

    if (storage === "local" && (!isWindowDefined() || !window.localStorage)) {
      throw new Error("No local storage found!")
    }

    this.storage = storage === "local" ? localStorage : sessionStorage
  }

  set(key: string, data: unknown): void {
    const body = SuperJSON.stringify(data)

    this.storage.setItem(key, body)
  }

  get<T extends unknown>(key: string): T | null {
    const item = this.storage.getItem(key)

    if (!item) {
      return null
    }

    return SuperJSON.parse<T>(item)
  }

  remove(key: string): void {
    this.storage.removeItem(key)
  }

  get list(): Array<unknown> {
    return Object.entries(this.storage)
      .map(([key, item]) => {
        try {
          return {
            id: key,
            ...JSON.parse(item),
          }
        } catch (error) {
          return null
        }
      })
      .filter((item) => !!item)
  }
}
