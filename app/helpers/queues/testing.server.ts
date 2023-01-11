import { createQueue } from "~/helpers/queue.server"

type QueueData = {
  url: string
}

const queue = createQueue<QueueData>("notifier", async (job) => {
  console.log(`Received request: ${job.data.url}`)
  console.log("Processing...")
  // Delay 1 second to simulate sending an email, be it for user registration, a newsletter, etc.
  await new Promise((resolve) => setTimeout(resolve, 1000))

  console.log(`Finished processing request: ${job.data.url}`)
})

export default queue
