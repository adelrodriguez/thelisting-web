import type { ComponentProps } from "react"
import { useControlField, useField } from "remix-validated-form"

import { ListRadioGroup } from "~/components/common"

type FormListRadioGroupOption = ComponentProps<typeof ListRadioGroup>["value"] & { value: string }

/**
 * This component should only be used within a Form component.
 * @deprecated Use ListRadioGroup instead.
 */
export default function FormListRadioGroup<T extends FormListRadioGroupOption>({
  description,
  label,
  name,
  options,
  required,
}: {
  name: string
  options: T[]
  label?: string
  required?: boolean
} & Omit<ComponentProps<typeof ListRadioGroup>, "onChange" | "value">) {
  const { error, getInputProps } = useField(name)
  const [value, setValue] = useControlField<string>(name)

  return (
    <>
      <input {...getInputProps({ required, value })} type="hidden" />
      <ListRadioGroup<T>
        description={error || description}
        error={!!error}
        label={label}
        name={name}
        onChange={(option) => setValue(option.value)}
        options={options}
        required={required}
        value={options.find((option) => option.value === value)!}
      />
    </>
  )
}
