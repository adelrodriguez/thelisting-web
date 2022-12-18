import type { ReactElement, ComponentProps } from "react"
import type { Path, FieldValues } from "react-hook-form"
import { useController } from "react-hook-form"

import { SelectField } from "~/components/common"

/**
 * This component should only be used within a Form component.
 */
export default function SelectInput<FormData extends FieldValues>({
  name,
  description,
  ...props
}: {
  name: Path<FormData>
} & ComponentProps<typeof SelectField>): ReactElement {
  const { field, fieldState, formState } = useController({ name })
  const { defaultValues } = formState

  return (
    <SelectField
      {...field}
      {...props}
      onChange={field.onChange}
      defaultValue={defaultValues && defaultValues[name]}
      error={!!fieldState.error}
      description={fieldState.error?.message || description}
    />
  )
}
