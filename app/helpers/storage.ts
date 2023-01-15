import { isWindowDefined } from "~/utils/window"

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
    const body = JSON.stringify(data, this.replacer)

    this.storage.setItem(key, body)
  }

  get(key: string): unknown {
    const item = this.storage.getItem(key)

    if (!item) {
      return null
    }

    const unsafeParsed = JSON.parse(item, this.reviver) as unknown

    return unsafeParsed
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

  private replacer(key: string, value: unknown): unknown {
    if (value instanceof Map) {
      return {
        dataType: "Map",
        value: Array.from(value.entries()),
      }
    } else {
      return value
    }
  }

  private reviver(key: string, value: unknown): unknown {
    if (typeof value === "object" && value !== null) {
      // TODO(adelrodriguez): We are casting as any because TS is not
      // recognizing the dataType or value properties. This is probably fine but
      // every time I encounter some casting, I'm kinda worried.
      if ((value as any).dataType === "Map") {
        return new Map((value as any).value)
      }
    }

    return value
  }
}
