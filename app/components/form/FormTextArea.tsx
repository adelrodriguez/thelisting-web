import type { ReactElement, ComponentProps } from "react"
import { useField } from "remix-validated-form"

import TextArea from "~/components/common/TextArea"

/**
 * This component should only be used within a Form component.
 */
export default function TextAreaInput({
  name,
  description,
  ...props
}: {
  name: string
} & ComponentProps<typeof TextArea>): ReactElement {
  const { error, getInputProps } = useField(name)

  return (
    <TextArea
      {...getInputProps({ id: name })}
      {...props}
      error={!!error}
      description={error || description}
    />
  )
}
