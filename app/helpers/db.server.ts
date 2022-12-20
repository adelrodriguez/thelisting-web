import { PrismaClient } from "@prisma/client"

import { isProduction } from "~/config/vars.server"

let db: PrismaClient

declare global {
  var __db: PrismaClient | undefined
}

// This are precautions put into place above that prevent live-reloads from
// saturating the database with connections while developing.
if (isProduction) {
  db = new PrismaClient()
  db.$connect()
} else {
  if (!global.__db) {
    global.__db = new PrismaClient()
    global.__db.$connect()
  }
  db = global.__db
}

export default db
