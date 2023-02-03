import type { ComponentProps } from "react"
import { useControlField, useField } from "remix-validated-form"

import { ListRadioGroup } from "~/components/common"

type FormListRadioGroupOption = ComponentProps<
  typeof ListRadioGroup
>["value"] & { value: string }

/**
 * This component should only be used within a Form component.
 */
export default function FormInput<T extends FormListRadioGroupOption>({
  name,
  options,
  ...props
}: {
  name: string
  options: T[]
} & Omit<ComponentProps<typeof ListRadioGroup>, "onChange" | "value">) {
  const { getInputProps } = useField(name)
  const [value, setValue] = useControlField<string>(name)

  return (
    <>
      <input {...getInputProps({ value })} type="hidden" />
      <ListRadioGroup<T>
        {...props}
        options={options}
        value={options.find((option) => option.value === value)!}
        onChange={(option) => setValue(option.value)}
      />
    </>
  )
}
