import { PrismaClient } from "@prisma/client"

import { isProduction } from "~/config/vars"

let prisma: PrismaClient

declare global {
  var __db: PrismaClient | undefined
}

// This are precautions put into place above that prevent live-reloads from
// saturating the database with connections while developing.
if (isProduction) {
  prisma = new PrismaClient()
  prisma.$connect()
} else {
  if (!global.__db) {
    global.__db = new PrismaClient()
    global.__db.$connect()
  }
  prisma = global.__db
}

export default prisma
