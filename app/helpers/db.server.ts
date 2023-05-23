import { PrismaClient } from "@prisma/client"

import { isProduction } from "~/config/vars"

let db: PrismaClient

declare global {
  // eslint-disable-next-line no-var
  var __db: PrismaClient | undefined
}

// This are precautions put into place above that prevent live-reloads from
// saturating the database with connections while developing.
if (isProduction) {
  db = new PrismaClient()
  void db.$connect()
} else {
  if (!global.__db) {
    global.__db = new PrismaClient()
    void global.__db.$connect()
  }
  db = global.__db
}

export default db
