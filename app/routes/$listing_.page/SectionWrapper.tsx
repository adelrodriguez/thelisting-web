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
    if (isInView && onView) {
      onView()
    }
  }, [isInView, onView])

  return (
    <section
      className={clsx(
        "relative flex min-h-0 min-w-0 flex-col items-center justify-center",
        className,
      )}
      ref={ref}
      style={styles}
    >
      {children}
    </section>
  )
}
