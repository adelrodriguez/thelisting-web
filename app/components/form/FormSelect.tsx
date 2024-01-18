import type { ComponentProps } from "react"
import { useField } from "remix-validated-form"

import { Select } from "~/components/common"

/**
 * This component should only be used within a Form component.
 * @deprecated Use Select instead.
 */
export default function FormSelect({
  description,
  name,
  options,
  ...props
}: {
  name: string
} & ComponentProps<typeof Select>) {
  const { error, getInputProps } = useField(name)

  return (
    <Select
      {...getInputProps({ id: name, options })}
      {...props}
      description={error || description}
      error={!!error}
    />
  )
}
