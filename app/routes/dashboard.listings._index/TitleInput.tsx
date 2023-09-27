import { MagnifyingGlassIcon } from "@heroicons/react/20/solid"
import { useSearchParams } from "@remix-run/react"
import debounce from "lodash/debounce"
import { ChangeEvent } from "react"

export default function TitleInput() {
  const [searchParams, setSearchParams] = useSearchParams()

  const debouncedSetSearchParams = debounce((title: string) => {
    setSearchParams((params) => {
      params.set("title", title)

      return params
    })
  }, 500)

  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    debouncedSetSearchParams(event.target.value)
  }

  return (
    <div className="relative rounded-md shadow-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <MagnifyingGlassIcon
          aria-hidden="true"
          className="h-5 w-5 text-slate-400"
        />
      </div>
      <input
        className="block w-full rounded-md border-0 py-1.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6"
        defaultValue={searchParams.get("title") ?? ""}
        id="title"
        name="title"
        onChange={handleSearch}
        placeholder="Search for a listing"
        type="text"
      />
    </div>
  )
}
