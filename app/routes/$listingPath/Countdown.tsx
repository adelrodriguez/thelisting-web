import { intervalToDuration, isPast } from "date-fns"
import { useEffect, useMemo, useState } from "react"

import { Spinner } from "~/components/loading"
import { useInterval } from "~/utils/hooks"
import type { CountdownProperties } from "~/utils/ribbons"
import { capitalize } from "~/utils/string"
import { isWindowDefined } from "~/utils/window"

import useTheme from "./ThemeProvider"

function getRemainingTime(eventDatetime: Date) {
  // If the event has already passed, return a duration of 0.
  if (isPast(eventDatetime)) {
    return intervalToDuration({ end: new Date(), start: new Date() })
  }

  return intervalToDuration({ end: eventDatetime, start: new Date() })
}

export default function Countdown({ eventDatetime }: CountdownProperties) {
  const datetime = useMemo(() => new Date(eventDatetime), [eventDatetime])
  const [remaining, setRemaining] = useState(getRemainingTime(datetime))
  const { theme } = useTheme()

  const clearInterval = useInterval(() => {
    setRemaining(getRemainingTime(datetime))
  }, 1000)

  useEffect(() => {
    // If the event has already passed, clear the interval.
    if (isPast(datetime)) {
      clearInterval()
    }
  }, [clearInterval, datetime])

  // TODO(adelrodriguez): Set a loading component
  if (!isWindowDefined()) {
    return (
      <div className="flex w-full justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    )
  }

  return (
    <div className="grid h-full w-full grid-cols-5 items-center justify-around">
      {Object.keys(remaining)
        .filter((key) => key !== "years")
        .map((key) => (
          <div className="flex flex-col items-center" key={key}>
            <div className="text-4xl lg:text-5xl" style={{ fontFamily: theme.fonts?.heading }}>
              {remaining[key as keyof typeof remaining]}
            </div>
            <div className="pt-1 font-body text-sm">{capitalize(key)}</div>
          </div>
        ))}
    </div>
  )
}
