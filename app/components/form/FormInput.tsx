import type { ComponentProps } from "react"
import { useField } from "remix-validated-form"

import { Input } from "~/components/common"

/**
 * This component should only be used within a Form component.
 */
export default function FormInput({
  name,
  description,
  ...props
}: {
  name: string
} & ComponentProps<typeof Input>) {
  const { error, getInputProps } = useField(name)

  return (
    <Input
      {...getInputProps({ id: name })}
      {...props}
      error={!!error}
      description={error || description}
    />
  )
}
