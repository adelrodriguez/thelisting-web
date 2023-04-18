import { intervalToDuration, isPast } from "date-fns"
import { useEffect, useState } from "react"
import { ClientOnly } from "remix-utils"

import { Spinner } from "~/components/loading"
import { useInterval } from "~/utils/hooks"
import type { CountdownProperties } from "~/utils/ribbons"
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
      <div className="flex h-20 items-center md:px-4">
        <ClientOnly
          fallback={
            <div className="flex w-full justify-center">
              <Spinner className="h-10 w-10" />
            </div>
          }
        >
          {() => (
            <div className="flex w-full justify-around">
              {Object.keys(remaining)
                .filter((key) => key !== "years")
                .map((key) => (
                  <div className="flex flex-col items-center" key={key}>
                    <div className="font-header text-2xl font-bold lg:text-3xl xl:text-5xl">
                      {remaining[key as keyof typeof remaining]}
                    </div>
                    <div className="font-body text-sm font-bold">
                      {capitalize(key)}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </ClientOnly>
      </div>
      {/* // TODO(adelrodriguez): Set a loading component */}
    </section>
  )
}
