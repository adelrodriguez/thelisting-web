import { ONE_WEEK } from "~/config/consts"
import { AutomatedAbandonedCheckoutsNotification } from "~/helpers/queues"

export default async function cron() {
  await AutomatedAbandonedCheckoutsNotification.add("abandoned", null, {
    removeOnComplete: {
      age: ONE_WEEK.inSeconds, // 7 days
    },
    removeOnFail: 5000,
    repeat: {
      pattern: "*/5 * * * *", // every 5 minutes
    },
  })
}
