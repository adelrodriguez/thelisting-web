import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, Outlet, useFetcher, useLoaderData } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { setFormDefaults, validationError } from "remix-validated-form"
import { z } from "zod"
import { zx } from "zodix"

import { Button } from "~/components/common"
import { Autocomplete, Form, Input, SubmitButton } from "~/components/form"
import { getGoogleWebFontsList } from "~/utils/font"
import { ListingThemeSchema } from "~/utils/listing"

import PageRibbons from "./PageRibbons"
import RibbonsPreview from "./RibbonsPreview"

export const handle = {
  id: "dashboard-listings-ribbons",
}

export const themeValidator = withZod(ListingThemeSchema)

export async function loader({ params, context }: LoaderArgs) {
  const db = context.db
  const cache = context.cache

  const { listing: sku } = zx.parseParams(
    params,
    z.object({ listing: z.coerce.number() })
  )

  const [listing, ribbons, fonts] = await Promise.all([
    db.listing.findUniqueOrThrow({
      select: { path: true, theme: true },
      where: { sku },
    }),
    db.ribbon.findMany({
      orderBy: { position: "asc" },
      where: { listing: { sku } },
    }),
    getGoogleWebFontsList(cache),
  ])

  const theme = ListingThemeSchema.parse(listing.theme)

  return json({
    fonts,
    listing,
    ribbons,
    ...setFormDefaults("edit-theme", theme),
  })
}

export async function action({ request, context, params }: ActionArgs) {
  const db = context.db
  const { listing: sku } = zx.parseParams(
    params,
    z.object({ listing: z.coerce.number() })
  )
  const formData = await request.formData()
  const subaction = formData.get("subaction")

  if (subaction === "ribbons") {
    const jsonData = z.string().parse(formData.get("ribbonIds"))
    const unparsedIds = JSON.parse(jsonData)
    const ribbonIds = z.array(z.string()).parse(unparsedIds)

    for (const [index, id] of ribbonIds.entries()) {
      await db.ribbon.update({
        data: { position: index },
        where: { id },
      })
    }

    return null
  }

  if (subaction === "theme") {
    const result = await themeValidator.validate(formData)

    if (result.error) {
      return validationError(result.error)
    }

    const { theme } = await db.listing.update({
      data: { theme: result.data },
      select: { theme: true },
      where: { sku },
    })

    return json({ theme })
  }

  return null
}

// TODO(adelrodriguez): Fix this
export function ErrorBoundary({ error }: { error: Error }) {
  return <div className="pt-2">There was an error. Error: {error.message}</div>
}

export default function DashboardListingRibbonsPage() {
  const { listing, ribbons, fonts } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()

  async function submitOrder(ribbonIds: string[]) {
    await fetcher.submit(
      { ribbonIds: JSON.stringify(ribbonIds), subaction: "ribbons" },
      { method: "post" }
    )
  }

  return (
    <>
      <div className="mt-4 grid grid-cols-1 items-start gap-4 md:grid-cols-8 md:gap-6">
        <div className="gap-4 md:col-span-3">
          <section>
            <div className="rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                <h2 className="text-base font-semibold leading-6 text-gray-700">
                  Page
                </h2>
              </div>
              <div className="px-6 py-2">
                {ribbons.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <p className="text-sm text-gray-500">
                      No ribbons have been added to this page yet.
                    </p>
                    <Link preventScrollReset relative="route" to="new">
                      <Button>Create a ribbon</Button>
                    </Link>
                  </div>
                ) : (
                  <DndProvider backend={HTML5Backend}>
                    {/* TODO: Fix this type error that's happening due to serialization from Remix */}
                    {/* @ts-expect-error Due to serialized type */}
                    <PageRibbons onMove={submitOrder} ribbons={ribbons} />
                  </DndProvider>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="gap-4 md:col-span-2">
          <section>
            <div className="rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                <h2 className="text-base font-semibold leading-6 text-gray-700">
                  Theme
                </h2>
              </div>
              <div className="px-6 py-2">
                <Form
                  className="flex flex-col gap-2 py-3"
                  id="edit-theme"
                  method="POST"
                  subaction="theme"
                  validator={themeValidator}
                >
                  <Input
                    label="Background Color"
                    name="colors.background"
                    type="color"
                  />
                  <Input
                    label="Primary Color"
                    name="colors.primary"
                    type="color"
                  />
                  <Input
                    label="Secondary Color"
                    name="colors.secondary"
                    type="color"
                  />
                  <Input label="Text Color" name="colors.text" type="color" />
                  <Autocomplete
                    label="Heading Font"
                    name="fonts.heading"
                    options={fonts.map((font) => ({
                      label: font,
                      value: font,
                    }))}
                  />
                  <Autocomplete
                    label="Body Font"
                    name="fonts.body"
                    options={fonts.map((font) => ({
                      label: font,
                      value: font,
                    }))}
                  />
                  <SubmitButton className="mt-2" loadingText="Saving...">
                    Save
                  </SubmitButton>
                </Form>
              </div>
            </div>
          </section>
        </div>

        <div className="gap-4 md:col-span-3">
          <section>
            <div className="rounded-lg bg-white shadow">
              <div className="flex justify-between border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                <h2 className="text-base font-semibold leading-6 text-gray-700">
                  Preview
                </h2>
                <Link target="_blank" to={`/${listing.path}/page`}>
                  <ArrowTopRightOnSquareIcon className="inline-block h-4 w-4" />
                </Link>
              </div>
              {/* TODO: Fix this type error that's happening due to serialization from Remix */}
              {/* @ts-expect-error Due to serialization */}
              <RibbonsPreview path={listing.path} ribbons={ribbons} />
            </div>
          </section>
        </div>
      </div>
      <Outlet />
    </>
  )
}
