import { ChatPostMessageArguments } from "@slack/web-api"
import { Processor } from "bullmq"

import { QUEUE_NAMES } from "~/config/consts"
import { createQueue } from "~/helpers/queue.server"
import slack from "~/services/slack.server"

export type QueueData = {
  channel:
    | "alerts-jobs"
    | "notifications-abandoned-checkouts"
    | "notifications-orders"
} & ChatPostMessageArguments

export const processor: Processor<QueueData> = async (job) => {
  const channel = job.data.channel

  await slack.chat.postMessage({
    ...job.data,
    channel,
  })
}

export default createQueue(QUEUE_NAMES.SendSlackMessage, processor)
