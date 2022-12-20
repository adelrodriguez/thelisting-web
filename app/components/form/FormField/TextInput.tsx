import type { ReactElement, ComponentProps } from "react"
import type { Path, FieldValues } from "react-hook-form"
import { useController } from "react-hook-form"

import Input from "~/components/common/Input"

/**
 * This component should only be used within a Form component.
 */
export default function TextInput<FormData extends FieldValues>({
  name,
  description,
  ...props
}: {
  name: Path<FormData>
} & ComponentProps<typeof Input>): ReactElement {
  const { field, fieldState } = useController({ name })

  return (
    <Input
      {...field}
      {...props}
      error={!!fieldState.error}
      description={fieldState.error?.message || description}
    />
  )
}
