import clsx from "clsx"
import { useInView } from "framer-motion"
import { useRef, type ReactNode, ElementRef, useEffect } from "react"

import { RibbonBase } from "~/utils/ribbons"

export default function SectionWrapper({
  children,
  className,
  onView,
  styles,
}: {
  children: ReactNode
  className?: string
  onView?: () => void
  styles?: RibbonBase["styles"]
}) {
  const ref = useRef<ElementRef<"section">>(null)
  // We run the `useInView` hook twice to get two different thresholds. One is
  // for triggering the callback function, the other for showing the component.
  const isInView = useInView(ref, { amount: 1 })
  const show = useInView(ref, { amount: 0.75, once: true })

  useEffect(() => {
    if (isInView && onView) {
      onView()
    }
  }, [isInView, onView])

  return (
    <section
      className={clsx(
        "relative flex min-h-0 min-w-0 flex-col items-center justify-center transition-opacity duration-1000 ease-in-out",
        show ? "opacity-100" : "opacity-0",
        className,
      )}
      ref={ref}
      style={styles}
    >
      {children}
    </section>
  )
}
