import { format, parseISO } from "date-fns"
import type { ComponentProps } from "react"
import { useField } from "remix-validated-form"

import { Input } from "~/components/common"

function parseDate(date?: string | Date): string {
  if (typeof date === "string") {
    return format(parseISO(date), "yyyy-MM-dd")
  }

  if (date instanceof Date) {
    return format(date, "yyyy-MM-dd")
  }

  return format(new Date(), "yyyy-MM-dd")
}

/**
 * This component should only be used within a Form component.
 */
export default function FormDate({
  name,
  description,
  min,
  max,
  ...props
}: {
  name: string
  min?: Date
  max?: Date
} & Omit<ComponentProps<typeof Input>, "min" | "max">) {
  const { error, getInputProps } = useField(name)
  const inputProps = getInputProps()

  return (
    <Input
      {...inputProps}
      {...props}
      defaultValue={parseDate(inputProps.defaultValue)}
      description={error || description}
      error={!!error}
      max={max && format(max, "yyyy-MM-dd")}
      min={min && format(min, "yyyy-MM-dd")}
      type="date"
    />
  )
}
