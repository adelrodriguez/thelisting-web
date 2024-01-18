import clsx from "clsx"
import type { ReactNode } from "react"

export default function SectionWrapper({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={clsx(
        "h-screen min-h-0 min-w-0 shrink-0 grow-0 basis-full",
        className,
      )}
    >
      {children}
    </section>
  )
}
