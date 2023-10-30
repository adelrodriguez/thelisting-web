import Redis from "ioredis"

import { REDIS_CACHE_URL } from "~/config/env.server"
import { singleton } from "~/utils/singleton.server"

const redis = singleton(
  "redis",
  () =>
    new Redis(REDIS_CACHE_URL, {
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    }),
)

export default redis
