import clsx from "clsx"
import type { ReactElement, ReactNode, ButtonHTMLAttributes } from "react"

export default function Button({
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
  variant?: "primary" | "secondary"
} & ButtonHTMLAttributes<HTMLButtonElement>): ReactElement {
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex items-center justify-center border   font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2",
        {
          "rounded px-2.5 py-2 text-xs": size === "xs",
          "rounded-md px-3 py-2 text-sm": size === "sm",
          "rounded-md px-4 py-2 text-base": size === "lg",
          "rounded-md px-4 py-2 text-sm": size === "md",
          "rounded-md px-6 py-3 text-base": size === "xl",
        },
        {
          "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500":
            variant === "secondary",
          "border-transparent bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500":
            variant === "primary",
        },
        { "opacity-50 cursor-not-allowed": disabled },
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
