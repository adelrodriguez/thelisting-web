import { intervalToDuration, isPast } from "date-fns"
import { useEffect, useState } from "react"
import { ClientOnly } from "remix-utils"

import { useInterval } from "~/utils/hooks"
import type { CountdownProperties } from "~/utils/ribbon"
import { capitalize } from "~/utils/string"

function getRemainingTime(eventDatetime: Date) {
  // If the event has already passed, return a duration of 0.
  if (isPast(eventDatetime)) {
    return intervalToDuration({ end: new Date(), start: new Date() })
  }

  return intervalToDuration({ end: eventDatetime, start: new Date() })
}

export default function Countdown({ eventDatetime }: CountdownProperties) {
  const [remaining, setRemaining] = useState(getRemainingTime(eventDatetime))

  const clearInterval = useInterval(() => {
    setRemaining(getRemainingTime(eventDatetime))
  }, 1000)

  useEffect(() => {
    // If the event has already passed, clear the interval.
    if (isPast(eventDatetime)) {
      clearInterval()
    }
  }, [clearInterval, eventDatetime])

  return (
    <section>
      {/* // TODO(adelrodriguez): Set a loading component */}
      <ClientOnly fallback={<div>Loading...</div>}>
        {() => (
          <div className="flex w-full justify-around">
            {Object.keys(remaining)
              .filter((key) => key !== "years")
              .map((key) => (
                <div className="flex w-24 flex-col items-center" key={key}>
                  <div className="text-3xl font-bold md:text-6xl">
                    {remaining[key as keyof typeof remaining]}
                  </div>
                  <div className="text-sm font-bold">{capitalize(key)}</div>
                </div>
              ))}
          </div>
        )}
      </ClientOnly>
    </section>
  )
}
