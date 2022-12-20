import type { ReactElement, ComponentProps } from "react"
import type { Path, FieldValues } from "react-hook-form"
import { useController } from "react-hook-form"

import { Input } from "~/components/common"

/**
 * This component should only be used within a Form component.
 */
export default function DateInput<FormData extends FieldValues>({
  name,
  description,
  min,
  max,
  ...props
}: {
  name: Path<FormData>
} & ComponentProps<typeof Input>): ReactElement {
  const { field, fieldState } = useController({ name })

  return (
    <Input
      {...field}
      {...props}
      type="date"
      min={min}
      max={max}
      error={!!fieldState.error}
      description={fieldState.error?.message || description}
    />
  )
}
