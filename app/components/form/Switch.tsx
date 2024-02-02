import { Switch } from "@headlessui/react"
import clsx from "clsx"
import { type ComponentProps } from "react"
import { useControlField } from "remix-validated-form"

import type { Input } from "~/components/form"

/**
 * This component should only be used within a Form component.
 */
export default function FormSwitch({
  description,
  label,
  name,
}: ComponentProps<typeof Input>) {
  const [value, setValue] = useControlField<boolean>(name)

  return (
    <Switch.Group as="div" className="flex items-center">
      <Switch
        checked={!!value}
        className={clsx(
          value ? "bg-slate-600" : "bg-gray-200",
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2",
        )}
        name={name}
        onChange={setValue}
      >
        <span
          aria-hidden="true"
          className={clsx(
            value ? "translate-x-5" : "translate-x-0",
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          )}
        />
      </Switch>
      <span className="ml-3 flex flex-grow flex-col">
        <Switch.Label
          as="span"
          className="text-sm font-medium leading-6 text-gray-900"
          passive
        >
          {label}
        </Switch.Label>
        {description && (
          <Switch.Description as="span" className="text-sm text-gray-500">
            {description}
          </Switch.Description>
        )}
      </span>
    </Switch.Group>
  )
}
