import {
  ExpressAdapter,
  createBullBoard,
  BullMQAdapter,
} from "@bull-board/express"
import express from "express"
import basicAuth from "express-basic-auth"

import {
  BULL_BOARD_PASSWORD,
  BULL_BOARD_PORT,
  RAILWAY_STATIC_URL,
} from "~/config/env.server"
import {
  addItemToListingQueue,
  clearCartQueue,
  createInvoiceQueue,
  createListingCommerceEntityQueue,
  createPurchaseQueue,
  notifyPurchaseQueue,
  saveOrderCustomerQueue,
} from "~/helpers/queues"
import { logger } from "~/utils/log"

const port = BULL_BOARD_PORT || process.env.PORT || 3001

const serverAdapter = new ExpressAdapter()

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
  queues: [
    addItemToListingQueue,
    createInvoiceQueue,
    createListingCommerceEntityQueue,
    createPurchaseQueue,
    notifyPurchaseQueue,
    saveOrderCustomerQueue,
    clearCartQueue,
  ].map((queue) => new BullMQAdapter(queue)),
  serverAdapter: serverAdapter,
})

const app = express()

app.use(
  "/",
  basicAuth({
    challenge: true,
    users: { admin: BULL_BOARD_PASSWORD ?? "admin" },
  }),
  serverAdapter.getRouter()
)

app.listen(port, () => {
  logger.info(`Bull Board is listening on port ${port}`)
  logger.info(`For the UI, open http://localhost:${port}`)
})
