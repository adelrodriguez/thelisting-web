import {
  ExpressAdapter,
  createBullBoard,
  BullMQAdapter,
} from "@bull-board/express"
import express from "express"
import basicAuth from "express-basic-auth"

import {
  saveOrderCustomerQueue,
  createInvoiceQueue,
  createPurchaseQueue,
} from "~/helpers/queues"
import { logger } from "~/utils/log"

const port = process.env.BULL_BOARD_PORT || process.env.PORT || 3001

const serverAdapter = new ExpressAdapter()

createBullBoard({
  options: {
    uiConfig: {
      // boardLogo: {
      //   height: 200,
      //   path: "https://cdn.my-domain.com/logo.png",
      //   width: "100px",
      // },
      boardTitle: "The Listing",
    },
  },
  queues: [saveOrderCustomerQueue, createInvoiceQueue, createPurchaseQueue].map(
    (queue) => new BullMQAdapter(queue)
  ),
  serverAdapter: serverAdapter,
})

const app = express()

app.use(
  "/",
  basicAuth({
    challenge: true,
    users: { admin: process.env.BULL_BOARD_PASSWORD ?? "admin" },
  }),
  serverAdapter.getRouter()
)

app.listen(port, () => {
  logger.info(`Bull Board is listening on port ${port}`)
  logger.info(`For the UI, open http://localhost:${port}`)
})
