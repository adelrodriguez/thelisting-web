import {
  XCircleIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/20/solid"
import clsx from "clsx"
import type { ReactNode } from "react"

export default function Alert({
  children,
  onClose,
  type,
}: {
  children: ReactNode
  type: "error" | "success"
  onClose: () => void
}) {
  return (
    <div
      className={clsx("rounded-md p-4", {
        "bg-green-50": type === "success",
        "bg-red-50": type === "error",
      })}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {type === "error" && (
            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          )}
          {type === "success" && (
            <CheckCircleIcon
              className="h-5 w-5 text-green-400"
              aria-hidden="true"
            />
          )}
        </div>
        <div className="ml-3">
          <div
            className={clsx("text-sm font-medium", {
              "text-green-800": type === "success",
              "text-red-800": type === "error",
            })}
          >
            {children}
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              className={clsx(
                "inline-flex rounded-md p-1.5  focus:outline-none focus:ring-2  focus:ring-offset-2",
                {
                  "bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600 focus:ring-offset-green-50":
                    type === "success",
                  "bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600 focus:ring-offset-red-50":
                    type === "error",
                }
              )}
              onClick={onClose}
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
