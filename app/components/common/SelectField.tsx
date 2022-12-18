import { Listbox, Transition } from "@headlessui/react"
import {
  CheckIcon,
  ChevronUpDownIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/20/solid"
import classNames from "classnames"
import type { ReactElement, Ref, SelectHTMLAttributes } from "react"
import { forwardRef, Fragment } from "react"

type Option = {
  label: string
  value: string | number
}

function SelectField(
  {
    label,
    name,
    description,
    error,
    disabled,
    required,
    placeholder,
    options,
    defaultValue,
    ...props
  }: {
    defaultValue?: Option
    description?: string
    disabled?: boolean
    error?: boolean
    label?: string
    name?: string
    options: Option[]
    placeholder?: string
    required?: boolean
    onChange?: (value: string | number | readonly string[]) => void
  } & SelectHTMLAttributes<HTMLSelectElement>,
  // TODO(adelrodriguez): Figure out how to correctly pass the ref into the
  // Listbox component
  ref: Ref<HTMLDivElement>
): ReactElement {
  return (
    <>
      <Listbox
        {...props}
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        by="value"
      >
        {({ open }) => (
          <>
            <Listbox.Label className="block text-sm font-medium text-gray-700">
              {label}
            </Listbox.Label>
            <div className="relative mt-1">
              <Listbox.Button
                className={classNames(
                  "relative",
                  "w-full",
                  "cursor-default",
                  "rounded-md",
                  "border",
                  "bg-white",
                  "focus:outline-none focus:ring-1",
                  "sm:text-sm",
                  "py-2 pl-3 pr-10 text-left shadow-sm",
                  {
                    "border-gray-300": !error,
                    "border-gray-300 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500":
                      disabled,
                    "border-red-300": error,
                    "focus:border-indigo-500  focus:ring-indigo-500": !error,
                    "focus:border-red-500 focus:ring-red-500": error,
                    "text-red-900 placeholder-red-300": error,
                  }
                )}
              >
                {({ value }: { value: Option }) => (
                  <>
                    <span className="block truncate">{value.label}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      {error && (
                        <ExclamationCircleIcon
                          className="h-5 w-5 text-red-500 ml-2"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  </>
                )}
              </Listbox.Button>

              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {options.map((option) => (
                    <Listbox.Option
                      key={option.value}
                      className="ui-active:bg-indigo-600 ui-active:text-white ui-not-active:text-gray-900 relative cursor-default select-none py-2 pl-3 pr-9"
                      value={option}
                    >
                      <span className="ui-selected::font-semibold ui-not-selected::font-normal block truncate">
                        {option.label}
                      </span>

                      <span className="ui-active:text-white ui-not-active:text-indigo-600 absolute inset-y-0 right-0 items-center pr-4 hidden ui-selected:flex">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
      {description && (
        <p
          className={classNames("mt-2 text-sm", {
            "text-gray-500": !error,
            "text-red-600": error,
          })}
          id={error ? `${name}-error` : `${name}-description`}
        >
          {description}
        </p>
      )}
    </>
  )
}

export default forwardRef(SelectField)
