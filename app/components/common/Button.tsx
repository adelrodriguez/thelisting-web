import clsx from "clsx"
import { forwardRef } from "react"
import type { ReactNode, Ref, ComponentPropsWithRef } from "react"

function Button(
  {
    children,
    type,
    className,
    size = "md",
    disabled,
    variant = "primary",
    ...props
  }: {
    children: ReactNode
    className?: string
    size?: "xs" | "sm" | "md" | "lg" | "xl"
    variant?: "primary" | "secondary" | "danger"
  } & ComponentPropsWithRef<"button">,
  ref: Ref<HTMLButtonElement>
) {
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className={clsx(
        "inline-flex items-center justify-center font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600",
        {
          "rounded px-2.5 py-2 text-xs": size === "xs",
          "rounded-md px-3 py-2 text-sm": size === "sm",
          "rounded-md px-4 py-2 text-base": size === "lg",
          "rounded-md px-4 py-2 text-sm": size === "md",
          "rounded-md px-6 py-3 text-base": size === "xl",
        },
        {
          "border-slate-300 bg-white text-slate-700 ring-1 ring-inset ring-gray-300 hover:bg-slate-50":
            variant === "secondary",
          "border-transparent bg-red-600 text-white hover:bg-red-500":
            variant === "danger",
          "border-transparent bg-slate-600 text-white hover:bg-slate-700 ":
            variant === "primary",
        },
        { "cursor-not-allowed opacity-50": disabled },
        className
      )}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default forwardRef(Button)
