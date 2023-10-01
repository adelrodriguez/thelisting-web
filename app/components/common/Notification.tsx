import { XMarkIcon } from "@heroicons/react/20/solid"
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline"
import type { CustomContentProps } from "notistack"
import { useSnackbar, SnackbarContent } from "notistack"
import type { Ref } from "react"
import { forwardRef } from "react"

declare module "notistack" {
  interface VariantOverrides {
    warning: {
      description?: string
    }
    success: {
      description?: string
    }
    error: {
      description?: string
    }
    info: {
      description?: string
    }
  }
}

function Notification(
  {
    id,
    message,
    description,
    variant,
  }: { description?: string } & CustomContentProps,
  ref: Ref<HTMLDivElement>,
) {
  const { closeSnackbar } = useSnackbar()

  return (
    <SnackbarContent key={id} ref={ref}>
      <div className="pointer-events-auto w-full overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 sm:w-96">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {variant === "success" && (
                <CheckCircleIcon
                  aria-hidden="true"
                  className="h-6 w-6 text-green-400"
                />
              )}
              {variant === "warning" && (
                <ExclamationCircleIcon
                  aria-hidden="true"
                  className="h-6 w-6 text-yellow-400"
                />
              )}
              {variant === "error" && (
                <ExclamationTriangleIcon
                  aria-hidden="true"
                  className="h-6 w-6 text-red-400"
                />
              )}
              {variant === "info" && (
                <InformationCircleIcon
                  aria-hidden="true"
                  className="h-6 w-6 text-blue-400"
                />
              )}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">{message}</p>
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                onClick={() => closeSnackbar(id)}
                type="button"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </SnackbarContent>
  )
}

export default forwardRef(Notification)
