import clsx from "clsx"
import { motion } from "framer-motion"
import type { ReactNode } from "react"

export default function SectionWrapper({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section>
      <div className={clsx("relative", className)}>
        <motion.div
          className="h-full"
          initial={{ opacity: 0 }}
          transition={{ duration: 1 }}
          viewport={{ amount: 0.5, once: true }}
          whileInView={{ opacity: 1 }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  )
}
