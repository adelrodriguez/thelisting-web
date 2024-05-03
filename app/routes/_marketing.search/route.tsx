import { Combobox } from "@headlessui/react"
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid"
import { ExclamationCircleIcon, PhotoIcon } from "@heroicons/react/24/outline"
import { type LoaderFunctionArgs, json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { intlFormat } from "date-fns"
import { useTranslation } from "react-i18next"
import { route } from "routes-gen"
import { z } from "zod"
import { zx } from "zodix"

import { useDebouncedSearchParam } from "~/utils/hooks"

export async function loader({ context, request }: LoaderFunctionArgs) {
  const db = context.db

  const { date, q } = zx.parseQuery(
    request,
    z.object({ date: z.coerce.date().optional(), q: z.string().optional() }),
  )

  const listings = await db.listing.findMany({
    orderBy: {
      eventDate: "asc",
    },
    select: {
      coverImage: true,
      eventDate: true,
      id: true,
      path: true,
      title: true,
    },
    take: 10,
    where: {
      AND: [
        {
          eventDate: {
            gte: date,
          },
        },
        {
          OR: [
            {
              title: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              subtitle: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              path: {
                contains: q,
                mode: "insensitive",
              },
            },
          ],
        },
      ],
      status: "Published",
    },
  })

  return json({ listings })
}

export default function Page() {
  const { listings } = useLoaderData<typeof loader>()
  const [query, setQuery] = useDebouncedSearchParam("q", 300)
  const { i18n, t } = useTranslation("marketing")

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-8 py-32 md:mx-auto md:w-1/2 md:min-w-[400px] xl:w-1/3">
      <Combobox>
        <div className="relative w-full">
          <MagnifyingGlassIcon
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
          />
          <Combobox.Input
            className="block h-12 w-full rounded-md border-0 bg-transparent py-1.5 pl-11 pr-4 text-gray-900 shadow-2xl ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 focus:drop-shadow-2xl sm:text-sm sm:leading-6"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("search.placeholder")}
          />
        </div>

        {listings.length > 0 && query !== "" && (
          <Combobox.Options
            className="min-h-[700px] w-full transform-gpu scroll-py-3 overflow-y-auto py-6"
            static
          >
            {listings.map((listing) => (
              <Combobox.Option
                className="flex cursor-default select-none rounded-xl p-4 ui-active:bg-gray-300"
                key={listing.id}
                value={listing}
              >
                <Link
                  className="flex w-full"
                  to={route("/:listingPath", {
                    listingPath: listing.path,
                  })}
                >
                  <div className="flex flex-none items-center justify-center rounded-lg">
                    {listing.coverImage ? (
                      <img
                        alt=""
                        className="h-12 w-24 rounded-lg object-cover"
                        src={listing.coverImage}
                      />
                    ) : (
                      <PhotoIcon aria-hidden="true" className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="ml-4 flex flex-auto flex-col justify-center">
                    <p className="text-sm font-medium text-gray-700 ui-active:text-gray-900">
                      {listing.title}
                    </p>
                    <p className="text-sm text-gray-500 ui-active:text-gray-700">
                      {intlFormat(
                        new Date(listing.eventDate),
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                        { locale: i18n.language },
                      )}
                    </p>
                  </div>
                </Link>
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}

        {query !== "" && listings.length === 0 && (
          <div className="px-6 py-14 text-center text-sm sm:px-14">
            <ExclamationCircleIcon
              className="mx-auto h-6 w-6 text-gray-400"
              name="exclamation-circle"
              type="outline"
            />
            <p className="mt-4 font-semibold text-gray-900">{t("search.no_results.title")}</p>
            <p className="mt-2 text-gray-500">{t("search.no_results.subtitle")}</p>
          </div>
        )}
      </Combobox>
    </div>
  )
}
