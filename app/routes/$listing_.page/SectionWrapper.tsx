import clsx from "clsx"
import { useInView } from "framer-motion"
import { useRef, type ReactNode, ElementRef, useEffect } from "react"

export default function SectionWrapper({
  children,
  mobileOnly = false,
  onView,
}: {
  children: ReactNode
  mobileOnly?: boolean
  onView: () => void
}) {
  const ref = useRef<ElementRef<"section">>(null)
  const isInView = useInView(ref, { amount: 0.7 })

  useEffect(() => {
    if (isInView) {
      ref.current?.scrollIntoView({ behavior: "smooth" })
      onView()
    }
  }, [isInView, onView])

  return (
    <section
      className={clsx("relative flex h-screen min-h-0 min-w-0 flex-col", {
        "sm:hidden": mobileOnly,
      })}
      ref={ref}
    >
      {children}
    </section>
  )
}
