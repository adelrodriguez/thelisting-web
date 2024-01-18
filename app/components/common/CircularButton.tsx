import clsx from "clsx"
import { ComponentPropsWithoutRef, ReactNode } from "react"

export default function Example({
  children,
  size = "md",
  ...props
}: {
  children?: ReactNode
  size?: "sm" | "md" | "lg"
} & Omit<ComponentPropsWithoutRef<"button">, "className">) {
  return (
    <button
      {...props}
      className={clsx(
        "rounded-full bg-slate-600 p-1 text-white shadow-sm hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
        {
          "p-1": size === "sm",
          "p-1.5": size === "md",
          "p-2": size === "lg",
        },
      )}
      type="button"
    >
      {children}
    </button>
  )
}
