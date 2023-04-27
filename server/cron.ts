import { AutomatedAbandonedCheckoutsNotification } from "~/helpers/queues"

export default async function cron() {
  await AutomatedAbandonedCheckoutsNotification.add("abandoned", null, {
    removeOnComplete: {
      age: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
    removeOnFail: 5000,
    repeat: {
      pattern: "*/5 * * * *", // every 5 minutes
    },
  })
}
