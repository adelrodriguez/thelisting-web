import type { Processor } from "bullmq"

import { QUEUE_NAMES } from "~/config/consts"
import { isDevelopment } from "~/config/vars"
import { createQueue } from "~/helpers/queue.server"
import alegra from "~/services/alegra.server"

export type QueueData = {
  emails: string[]
  invoiceId: string
}

export const processor: Processor<QueueData> = async (job) => {
  if (isDevelopment) {
    await job.log("Development mode, skipping")
    return
  }

  const emails = job.data.emails
  const invoiceId = job.data.invoiceId
  const invoiceNumber = job.name

  await alegra.invoices.send({ emails, id: invoiceId })

  await job.log(`Invoice ${invoiceNumber} sent to ${emails.join(", ")}`)
}

export default createQueue(QUEUE_NAMES.SendInvoice, processor)
