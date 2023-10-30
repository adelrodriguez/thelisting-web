import { PrismaClient } from "@prisma/client"

import { singleton } from "~/utils/singleton.server"

const prisma = singleton("prisma", () => {
  const client = new PrismaClient()

  void client.$connect()

  return client
})

export default prisma
