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
  /**
   * Always requires text since it's used as a fallback in places where blocks
   * can't be rendered.
   */
  text: string
} & ChatPostMessageArguments

export const processor: Processor<QueueData> = async (job) => {
  const channel = job.data.channel
  const text = job.data.text

  await slack.chat.postMessage({
    ...job.data,
    channel,
    text,
  })
}

export default createQueue(QUEUE_NAMES.SendSlackMessage, processor)
