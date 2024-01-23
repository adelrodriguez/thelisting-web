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
  const isInView = useInView(ref, { amount: 1 })

  useEffect(() => {
    if (isInView) {
      // TODO(adelrodriguez): Scroll into view when the section is in view. Need
      // to figure out if this is still possible with variable height sections.
      // ref.current?.scrollIntoView({ behavior: "smooth" })

      if (isInView && onView) {
        onView()
      }
    }
  }, [isInView, onView])

  return (
    <section
      className={clsx(
        "relative flex h-screen min-h-0 min-w-0 flex-col items-center justify-center",
        className,
      )}
      ref={ref}
      style={styles}
    >
      {children}
    </section>
  )
}
