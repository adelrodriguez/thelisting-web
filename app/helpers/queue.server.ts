import type { Processor } from "bullmq"
import { Queue, Worker } from "bullmq"

import { logger } from "~/utils/log"

import redis from "./redis.server"

export type RegisteredQueue = {
  queue: Queue
  worker: Worker
}

declare global {
  var __registeredQueues: Record<string, RegisteredQueue> | undefined
}

const registeredQueues =
  global.__registeredQueues || (global.__registeredQueues = {})

export function createQueue<Payload>(
  name: string,
  handler: Processor<Payload>
): Queue<Payload> {
  const registeredQueue = registeredQueues[name]

  if (registeredQueue) {
    return registeredQueue.queue
  }

  // BullMQ queues are the storage container managing jobs.
  const queue = new Queue<Payload>(name, { connection: redis })

  // Workers are where the meat of our processing lives within a queue.
  // They reach out to our redis connection and pull jobs off the queue
  // in an order determined by factors such as job priority, delay, etc.
  // The scheduler plays an important role in helping workers stay busy.
  const worker = new Worker<Payload>(name, handler, { connection: redis })

  registeredQueues[name] = { queue, worker }

  return queue
}
