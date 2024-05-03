import { ONE_WEEK } from "~/config/consts"
import { AutomatedAbandonedCheckoutsNotificationQueue } from "~/helpers/queues"

export default async function cron() {
  await AutomatedAbandonedCheckoutsNotificationQueue.add("abandoned-checkouts-notification", null, {
    removeOnComplete: {
      age: ONE_WEEK.inSeconds, // 7 days
    },
    removeOnFail: 5000,
    repeat: {
      pattern: "*/5 * * * *", // every 5 minutes
    },
  })
}
