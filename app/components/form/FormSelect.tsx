import type { ReactElement, ComponentProps } from "react"
import { useField } from "remix-validated-form"

import { Select } from "~/components/common"

export type { SelectOption } from "~/components/common"

/**
 * This component should only be used within a Form component.
 */
export default function SelectInput({
  name,
  description,
  options,
  ...props
}: {
  name: string
} & ComponentProps<typeof Select>): ReactElement {
  const { error, getInputProps } = useField(name)

  return (
    <Select
      {...getInputProps({ id: name, options })}
      {...props}
      error={!!error}
      description={error || description}
    />
  )
}
