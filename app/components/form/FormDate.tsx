import type { ComponentProps } from "react"
import { useField } from "remix-validated-form"

import { Input } from "~/components/common"

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
} & ComponentProps<typeof Input>) {
  const { error, getInputProps } = useField(name)

  return (
    <Input
      {...getInputProps({ id: name })}
      {...props}
      type="date"
      min={min}
      max={max}
      error={!!error}
      description={error || description}
    />
  )
}
