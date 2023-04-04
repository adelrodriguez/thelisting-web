import { intervalToDuration, isPast } from "date-fns"
import { useEffect, useState } from "react"
import { ClientOnly } from "remix-utils"

import { useInterval } from "~/utils/hooks"
import type { CountdownProperties } from "~/utils/ribbon"

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
            <CountdownNumber number={remaining.months} label="Months" />
            <CountdownNumber number={remaining.days} label="Days" />
            <CountdownNumber number={remaining.hours} label="Hours" />
            <CountdownNumber number={remaining.minutes} label="Minutes" />
            <CountdownNumber number={remaining.seconds} label="Seconds" />
          </div>
        )}
      </ClientOnly>
    </section>
  )
}

function CountdownNumber({
  number,
  label,
}: {
  number?: number
  label: string
}) {
  if (number === undefined) return null

  return (
    <div className="flex flex-col items-center">
      <div className="text-3xl font-bold md:text-6xl">{number}</div>
      <div className="text-sm font-bold">{label}</div>
    </div>
  )
}
