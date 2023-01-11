import type { Redis as RedisType, RedisOptions } from "ioredis"
import Redis from "ioredis"

import { REDIS_URL } from "~/config/env.server"
import { isProduction } from "~/config/vars.server"

let redis: RedisType

declare global {
  var __redis: RedisType | undefined
}

const redisOptions: RedisOptions = {
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
}

// This is needed because in development we don't want to restart the server
// with every change, but we want to make sure we don't create a new connection
// to the Redis with every change either.
if (isProduction) {
  redis = new Redis(REDIS_URL, redisOptions)
} else {
  if (!global.__redis) {
    global.__redis = new Redis(REDIS_URL, redisOptions)
  }
  redis = global.__redis
}

export default redis
