import { createBullBoard } from "@bull-board/api"
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter"
import { ExpressAdapter } from "@bull-board/express"
import { Queue } from "bullmq"
import Redis from "ioredis"
import EventEmitter from "node:events"

import { QUEUE_NAMES } from "~/config/consts"
import { RAILWAY_STATIC_URL, REDIS_JOBS_URL } from "~/config/env.server"

// We are doing this to avoid the following error: (node:57671)
// MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 41
// ready listeners added to [Commander]. Use emitter.setMaxListeners() to
// increase limit
EventEmitter.defaultMaxListeners = 100

const serverAdapter = new ExpressAdapter()
const path = "/dashboard/admin/bullboard"
serverAdapter.setBasePath(path)

const connection = new Redis(REDIS_JOBS_URL, {
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
})

createBullBoard({
  options: {
    uiConfig: {
      boardLogo: {
        height: "auto",
        path: `https://${RAILWAY_STATIC_URL}/assets/images/ribbon.svg`,
        width: 50,
      },
      boardTitle: "The Listing",
    },
  },
  queues: Object.values(QUEUE_NAMES)
    .map((queueName) => new Queue(queueName, { connection }))
    .map((queue) => new BullMQAdapter(queue)),
  serverAdapter: serverAdapter,
})

const router = serverAdapter.getRouter()

export default [path, router]
