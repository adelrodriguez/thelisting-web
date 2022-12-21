import type { ReactElement, ComponentProps } from "react"
import type { Path, FieldValues } from "react-hook-form"
import { useController } from "react-hook-form"

import TextArea from "~/components/common/TextArea"

/**
 * This component should only be used within a Form component.
 */
export default function TextAreaInput<FormData extends FieldValues>({
  name,
  description,
  ...props
}: {
  name: Path<FormData>
} & ComponentProps<typeof TextArea>): ReactElement {
  const { field, fieldState } = useController({ name })

  return (
    <TextArea
      {...field}
      {...props}
      error={!!fieldState.error}
      description={fieldState.error?.message || description}
    />
  )
}
