import clsx from "clsx"
import { useInView } from "framer-motion"
import { useRef, type ReactNode, ElementRef, useEffect } from "react"

export default function SectionWrapper({
  children,
  className,
  onView,
}: {
  children: ReactNode
  className?: string
  onView?: () => void
}) {
  const ref = useRef<ElementRef<"section">>(null)
  const isInView = useInView(ref, { amount: 0.7 })

  useEffect(() => {
    if (isInView) {
      ref.current?.scrollIntoView({ behavior: "smooth" })

      if (onView) {
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
    >
      {children}
    </section>
  )
}
