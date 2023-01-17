import clsx from "clsx"
import type { ReactElement, ReactNode, ButtonHTMLAttributes } from "react"

export default function Button({
  children,
  type,
  className,
  size = "md",
  disabled,
  ...props
}: {
  children: ReactNode
  className?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
} & ButtonHTMLAttributes<HTMLButtonElement>): ReactElement {
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex items-center justify-center border border-transparent bg-gray-600 font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
        {
          "rounded px-2.5 py-1.5 text-xs": size === "xs",
          "rounded-md px-3 py-2 text-sm leading-4": size === "sm",
          "rounded-md px-4 py-2 text-base": size === "lg",
          "rounded-md px-4 py-2 text-sm": size === "md",
          "rounded-md px-6 py-3 text-base": size === "xl",
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
