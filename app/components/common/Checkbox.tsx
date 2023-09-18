import type { ComponentPropsWithoutRef } from "react"
import { useRef, useEffect } from "react"

export default function Checkbox({
  indeterminate,
  ...props
}: { indeterminate?: boolean } & ComponentPropsWithoutRef<"input">) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof indeterminate === "boolean" && ref.current) {
      ref.current.indeterminate = !props.checked && indeterminate
    }
  }, [ref, indeterminate, props.checked])

  return (
    <input
      type="checkbox"
      ref={ref}
      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-gray-600 focus:ring-slate-600"
      {...props}
    />
  )
}
