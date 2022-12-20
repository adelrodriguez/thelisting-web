import type { HTMLProps } from "react"
import { useRef, useEffect } from "react"

export default function Checkbox({
  indeterminate,
  ...props
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null!)

  useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !props.checked && indeterminate
    }
  }, [ref, indeterminate, props.checked])

  return (
    <input
      type="checkbox"
      ref={ref}
      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
      {...props}
    />
  )
}
