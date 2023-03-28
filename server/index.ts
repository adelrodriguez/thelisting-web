// const path = require("path");
// const express = require("express");
// const compression = require("compression");
// const morgan = require("morgan");
// const { createRequestHandler } = require("@remix-run/express");
import {
  ExpressAdapter,
  createBullBoard,
  BullMQAdapter,
} from "@bull-board/express"
import { createRequestHandler } from "@remix-run/express"
import { Queue } from "bullmq"
import compression from "compression"
import express from "express"
import basicAuth from "express-basic-auth"
import Redis from "ioredis"
import morgan from "morgan"
import path from "path"

import { QUEUE_NAMES } from "~/config/consts"
import {
  BULL_BOARD_PASSWORD,
  RAILWAY_STATIC_URL,
  REDIS_JOBS_URL,
} from "~/config/env.server"
// import { clearCartQueue } from "~/helpers/queues"
import { logger } from "~/utils/log"

const port = process.env.PORT || 3000

const serverAdapter = new ExpressAdapter()
const jobBoardPath = "/dashboard/admin/jobs"
serverAdapter.setBasePath(jobBoardPath)

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
  // queues: [clearCartQueue].map((queue) => new BullMQAdapter(queue)),
  serverAdapter: serverAdapter,
})

const BUILD_DIR = path.join(process.cwd(), "build")

const app = express()

app.use(compression())

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by")

app.use(
  jobBoardPath,
  basicAuth({
    challenge: true,
    users: { admin: BULL_BOARD_PASSWORD ?? "admin" },
  }),
  serverAdapter.getRouter()
)

// Remix fingerprints its assets so we can cache forever.
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
)

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1h" }))

app.use(morgan("tiny"))

app.all(
  "*",
  process.env.NODE_ENV === "development"
    ? (req, res, next) => {
        purgeRequireCache()

        return createRequestHandler({
          build: require(BUILD_DIR),
          mode: process.env.NODE_ENV,
        })(req, res, next)
      }
    : createRequestHandler({
        build: require(BUILD_DIR),
        mode: process.env.NODE_ENV,
      })
)

app.listen(port, () => {
  logger.info(`Express server listening on port ${port}`)
  logger.info(
    `Bull Board is listening on port ${port}. For the UI, open http://localhost:${port}/jobs`
  )
})

function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  // alternatively you can set up nodemon/pm2-dev to restart the server on
  // file changes, but then you'll have to reconnect to databases/etc on each
  // change. We prefer the DX of this, so we've included it for you by default
  for (const key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      delete require.cache[key]
    }
  }
}
