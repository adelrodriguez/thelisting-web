/// <reference types="@remix-run/node" />
import type { PrismaClient } from "@prisma/client"
import type { Redis } from "ioredis"
import type { Logger } from "winston"

declare module "@remix-run/node" {
  export interface AppLoadContext {
    cache: Redis
    db: PrismaClient
    logger: Logger
    env: typeof import("~/config/env.server")
  }
}
