import { createRequestHandler } from "@remix-run/express"
import type { ServerBuild } from "@remix-run/node"
import { broadcastDevReady, installGlobals } from "@remix-run/node"
import chokidar from "chokidar"
import compression from "compression"
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express"
import morgan from "morgan"
import * as fs from "node:fs"
import * as path from "node:path"
import * as url from "node:url"
import sourceMapSupport from "source-map-support"

import env from "~/config/env.server"
import { isDevelopment } from "~/config/vars"
import cache from "~/helpers/cache.server"
import db from "~/helpers/db.server"
import logger from "~/helpers/logger.server"
import { getLocalNetworkIP } from "~/utils/network"

import bullboard from "./bullboard"
import cron from "./cron"

sourceMapSupport.install()
installGlobals()

void run()

async function run() {
  const BUILD_PATH = path.resolve("build/index.js")
  const initialBuild = await reimportServer()

  const app = express()

  app.use(compression())

  // http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
  app.disable("x-powered-by")

  // Set up BullBoard
  app.use(...bullboard)

  // Remix fingerprints its assets so we can cache forever
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
      ? createDevRequestHandler(initialBuild)
      : createRequestHandler({
          build: initialBuild,
          getLoadContext: () => ({ cache, db, env, logger }),
          mode: process.env.NODE_ENV,
        })
  )

  const port = process.env.PORT || 3000

  app.listen(port, () => {
    logger.info("⚡️ Ready: http://localhost:" + port)

    if (isDevelopment) {
      logger.info(`Local network IP: http://${getLocalNetworkIP()}:${port}}`)
      void broadcastDevReady(initialBuild)
    }

    // Start cron jobs
    logger.info("Starting cron jobs")
    void cron()
  })

  async function reimportServer(): Promise<ServerBuild> {
    // cjs: manually remove the server build from the require cache
    Object.keys(require.cache).forEach((key) => {
      if (key.startsWith(BUILD_PATH)) {
        delete require.cache[key]
      }
    })

    const stat = fs.statSync(BUILD_PATH)

    // convert build path to URL for Windows compatibility with dynamic `import`
    const BUILD_URL = url.pathToFileURL(BUILD_PATH).href

    // use a timestamp query parameter to bust the import cache
    return import(BUILD_URL + "?t=" + stat.mtimeMs)
  }

  function createDevRequestHandler(initialBuild: ServerBuild) {
    let build = initialBuild
    async function handleServerUpdate() {
      // 1. re-import the server build
      build = await reimportServer()
      // 2. tell Remix that this app server is now up-to-date and ready
      void broadcastDevReady(build)
    }

    chokidar
      .watch(BUILD_PATH, { ignoreInitial: true })
      .on("add", handleServerUpdate)
      .on("change", handleServerUpdate)

    // wrap request handler to make sure its recreated with the latest build for
    // every request
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        return createRequestHandler({
          build,
          getLoadContext: () => ({ cache, db, env, logger }),
          mode: "development",
        })(req, res, next)
      } catch (error) {
        next(error)
      }
    }
  }
}
