import { useSearchParams } from "@remix-run/react"
import { debounce } from "lodash"
import { useMemo } from "react"

export default function useDebouncedSearchParam(
  param: string,
  wait?: number,
): [string, (value: string) => void] {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchParam = searchParams.get(param) || ""

  const debouncedSetSearchParams = useMemo(
    () =>
      debounce((value: string) => {
        setSearchParams((params) => {
          if (value === "") {
            params.delete(param)
          } else {
            params.set(param, value)
          }

          return params
        })
      }, wait),
    [param, wait, setSearchParams],
  )

  return [searchParam, (value: string) => debouncedSetSearchParams(value)]
}
