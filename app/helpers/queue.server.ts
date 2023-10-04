import type { Processor } from "bullmq"
import { Queue, Worker } from "bullmq"
import { Redis } from "ioredis"

import { REDIS_JOBS_URL } from "~/config/env.server"
import { isProduction } from "~/config/vars"
import Sentry from "~/services/sentry"
import slack from "~/services/slack.server"
import { buildUrl } from "~/utils/url"

import logger from "./logger.server"

export type RegisteredQueue = {
  queue: Queue
  worker: Worker
}

declare global {
  // eslint-disable-next-line no-var
  var __registeredQueues: Record<string, RegisteredQueue> | undefined
}

const registeredQueues =
  global.__registeredQueues || (global.__registeredQueues = {})

const connection = new Redis(REDIS_JOBS_URL, {
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
})

export function createQueue<Payload>(
  name: string,
  handler: Processor<Payload>,
): Queue<Payload> {
  const registeredQueue = registeredQueues[name]

  if (registeredQueue) {
    return registeredQueue.queue
  }

  // BullMQ queues are the storage container managing jobs.
  const queue = new Queue<Payload>(name, { connection })

  // Workers are where the meat of our processing lives within a queue. They
  // reach out to our redis connection and pull jobs off the queue in an order
  // determined by factors such as job priority, delay, etc. The scheduler plays
  // an important role in helping workers stay busy.
  const worker = new Worker<Payload>(name, handler, { connection })

  // Handle job failures
  worker.on("failed", async (job, err) => {
    const queueUrl = buildUrl(
      `dashboard/admin/bullboard/queue/${name}/1?status=failed`,
    )

    // Log the error
    logger.error(err.message, { error: err, job: job?.name, queue: name })

    // Send an alert to Slack
    await slack.chat.postMessage({
      blocks: [
        {
          text: {
            text: `${
              !isProduction ? ":rotating_light:" : "(Development)"
            } Job *${job?.name}* failed on queue *${name}*: ${queueUrl}`,
            type: "mrkdwn",
          },
          type: "section",
        },
        {
          text: {
            text: `\`\`\`${err.stack}\`\`\``,
            type: "mrkdwn",
          },
          type: "section",
        },
      ],
      channel: "alerts-jobs",
    })

    // Capture the error in Sentry
    Sentry.captureException(err, {
      extra: {
        job,
      },
    })
  })

  registeredQueues[name] = { queue, worker }

  return queue
}
