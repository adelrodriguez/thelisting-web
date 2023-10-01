import { useEffect, useRef } from "react"

import useIsomorphicLayoutEffect from "./use-isomorphic-layout-effect"

export default function useInterval(
  callback: () => void,
  delay: number | null,
) {
  const savedCallback = useRef(callback)
  const savedId = useRef<NodeJS.Timer>()

  // Remember the latest callback if it changes.
  useIsomorphicLayoutEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (!delay && delay !== 0) {
      return
    }

    const id = setInterval(() => savedCallback.current(), delay)

    savedId.current = id

    return () => clearInterval(id)
  }, [delay])

  return () => clearInterval(savedId.current)
}
