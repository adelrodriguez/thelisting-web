import type { NumericFormatProps } from "react-number-format"
import { NumericFormat } from "react-number-format"

export default function FormattedNumber({
  children,
  thousands = false,
  decimals,
  input = false,
  ...props
}: {
  children: string | number
  thousands?: boolean
  decimals?: number
  input?: boolean
} & NumericFormatProps) {
  return (
    <NumericFormat
      {...props}
      thousandSeparator={thousands}
      decimalScale={decimals}
      fixedDecimalScale={!!decimals}
      defaultValue={"N/A"}
      value={children}
      displayType={input ? "input" : "text"}
    />
  )
}
