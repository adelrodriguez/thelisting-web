import { MinusIcon, PlusIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import { useTranslation } from "react-i18next"

export default function QuantityInput({
  max = 1,
  min = 1,
  onChange,
  value = 0,
}: {
  max?: number
  min?: number
  value?: number
  onChange: (quantity: number) => void
}) {
  const { t } = useTranslation("registry")

  return (
    <div className="isolate inline-flex rounded-md shadow-sm">
      <button
        className={clsx(
          "relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50",
          "focus:z-10 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500",
          "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
        )}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        type="button"
      >
        <span className="sr-only">{t("quantity.add")}</span>
        <MinusIcon aria-hidden="true" className="h-5 w-5" />
      </button>
      <div className="relative inline-flex items-center border border-x-0 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">
        {value}
      </div>
      <button
        className={clsx(
          "relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50",
          "focus:z-10 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500",
          "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
        )}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        type="button"
      >
        <span className="sr-only">{t("quantity.remove")}</span>
        <PlusIcon aria-hidden="true" className="h-5 w-5" />
      </button>
    </div>
  )
}
