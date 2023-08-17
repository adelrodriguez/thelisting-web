import { createRequestHandler } from "@remix-run/express"
import { broadcastDevReady } from "@remix-run/node"
import compression from "compression"
import express from "express"
import morgan from "morgan"
import { networkInterfaces } from "node:os"
import path from "node:path"

import { isDevelopment } from "~/config/vars"
import cache from "~/helpers/cache.server"
import db from "~/helpers/db.server"
import logger from "~/helpers/logger.server"

import bullboard from "./bullboard"
import cron from "./cron"

const port = process.env.PORT || 3000

const BUILD_DIR = path.join(process.cwd(), "build")

const app = express()

app.use(compression())

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by")

app.use(...bullboard)

// Remix fingerprints its assets so we can cache forever.
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
)

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1h" }))

app.use(
  morgan("tiny", {
    stream: {
      write: (message) => logger.http(message),
    },
  })
)

app.all(
  "*",
  process.env.NODE_ENV === "development"
    ? (req, res, next) => {
        purgeRequireCache()

        return createRequestHandler({
          build: require(BUILD_DIR),
          getLoadContext: () => ({ cache, db, logger }),
          mode: process.env.NODE_ENV,
        })(req, res, next)
      }
    : createRequestHandler({
        build: require(BUILD_DIR),
        getLoadContext: () => ({ cache, db, logger }),
        mode: process.env.NODE_ENV,
      })
)

app.listen(port, () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const build = require(BUILD_DIR)
  logger.info("Ready: http://localhost:" + port)

  if (isDevelopment) {
    logger.info(`Local network IP: http://${getLocalNetworkIP()}:${port}}`)
    void broadcastDevReady(build)
  }

  // Start cron jobs
  logger.info("Starting cron jobs")
  void cron()
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

function getLocalNetworkIP(): string {
  const nets = networkInterfaces()
  const results = Object.create(null) // Or just '{}', an empty object

  for (const name of Object.keys(nets)) {
    const _nets = nets[name]

    if (!_nets) continue

    for (const net of _nets) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
      const familyV4Value = typeof net.family === "string" ? "IPv4" : 4
      if (net.family === familyV4Value && !net.internal) {
        if (!results[name]) {
          results[name] = []
        }
        results[name].push(net.address)
      }
    }
  }

  return results["en0"][0]
}
