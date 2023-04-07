import type { Redis } from "ioredis"
import type { CacheConfig } from "remix-image/server"
import { CacheStatus } from "remix-image/server"

abstract class Cache {
  abstract config: CacheConfig

  abstract has(key: string): Promise<boolean>

  abstract status(key: string): Promise<CacheStatus>

  abstract get(key: string): Promise<Uint8Array | null>

  abstract set(key: string, resultImg: Uint8Array): Promise<void>

  abstract clear(): Promise<void>
}

/**
 * An image cache for Remix Image using Redis
 */
export class ImageCache extends Cache {
  config: CacheConfig
  cache: Redis

  constructor(_cache: Redis) {
    super()

    this.config = {
      tbd: 365 * 24 * 60 * 60,
      ttl: 24 * 60 * 60,
    }

    this.cache = _cache
  }

  async has(key: string): Promise<boolean> {
    return !!(await this.cache.exists(key))
  }

  async status(key: string): Promise<CacheStatus> {
    const has = await this.has(key)

    if (!has) {
      return CacheStatus.MISS
    }

    const ttl = await this.cache.ttl(key)

    if (ttl > 0) {
      return CacheStatus.HIT
    }

    return CacheStatus.STALE
  }

  async get(key: string): Promise<Uint8Array | null> {
    const has = await this.has(key)

    if (!has) {
      return null
    }

    const data = await this.cache.getBuffer(key)

    return data
  }

  async set(key: string, resultImg: Uint8Array): Promise<void> {
    await this.cache.set(key, Buffer.from(resultImg), "EX", this.config.ttl)
  }

  async clear(): Promise<void> {
    await this.cache.flushall()
  }
}
