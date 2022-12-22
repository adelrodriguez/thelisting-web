import { XMarkIcon } from "@heroicons/react/20/solid"
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline"
import type { CustomContentProps } from "notistack"
import { useSnackbar } from "notistack"
import { SnackbarContent } from "notistack"
import type { Ref } from "react"
import { forwardRef } from "react"

function Notification(
  {
    id,
    message,
    description,
    variant,
    ...props
  }: { description?: string } & CustomContentProps,
  ref: Ref<HTMLDivElement>
) {
  const { closeSnackbar } = useSnackbar()

  return (
    <SnackbarContent key={id} ref={ref} {...props}>
      <div className="pointer-events-auto w-full sm:w-96 overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {variant === "success" && (
                <CheckCircleIcon
                  className="h-6 w-6 text-green-400"
                  aria-hidden="true"
                />
              )}
              {variant === "warning" && (
                <ExclamationCircleIcon
                  className="h-6 w-6 text-yellow-400"
                  aria-hidden="true"
                />
              )}
              {variant === "error" && (
                <ExclamationTriangleIcon
                  className="h-6 w-6 text-yellow-400"
                  aria-hidden="true"
                />
              )}
              {variant === "info" && (
                <InformationCircleIcon
                  className="h-6 w-6 text-blue-400"
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">{message}</p>
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                type="button"
                className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={() => closeSnackbar(id)}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </SnackbarContent>
  )
}

export default forwardRef(Notification)
