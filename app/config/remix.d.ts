/// <reference types="@remix-run/node" />
import type { Logger } from "winston"

declare module "@remix-run/node" {
  export interface AppLoadContext {
    logger: Logger
  }
}
