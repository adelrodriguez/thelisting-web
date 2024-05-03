import { Tab } from "@headlessui/react"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  Link,
  Outlet,
  isRouteErrorResponse,
  useFetcher,
  useLoaderData,
  useRouteError,
} from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import clsx from "clsx"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { validationError } from "remix-validated-form"
import { route } from "routes-gen"
import { z } from "zod"
import { zx } from "zodix"

import { Button } from "~/components/common"
import { Autocomplete, Form, Input, SubmitButton, Switch } from "~/components/form"
import { getFontList } from "~/utils/font"
import { badRequest } from "~/utils/http"
import { ListingThemeSchema } from "~/utils/listing"
import type { RouteHandle } from "~/utils/remix"

import PagePreview from "./PagePreview"
import PageRibbons from "./PageRibbons"

export const handle: RouteHandle<{ listingSku: string }> = {
  crumb: ({ params }) => ({
    href: route("/dashboard/listings/:listingSku/ribbons", {
      listingSku: params.listingSku,
    }),
    name: "Ribbons",
  }),
  id: "dashboard-listings-listing-ribbons",
}

export const themeValidator = withZod(ListingThemeSchema)

export async function loader({ context, params }: LoaderFunctionArgs) {
  const db = context.db
  const cache = context.cache
  const env = context.env

  const { listingSku } = zx.parseParams(params, z.object({ listingSku: z.coerce.number() }))

  const [listing, fonts] = await Promise.all([
    db.listing.findUniqueOrThrow({
      include: {
        ribbons: {
          orderBy: { position: "asc" },
        },
      },
      where: { sku: listingSku },
    }),

    getFontList(cache, env.GOOGLE_WEB_FONTS_URL, env.GOOGLE_WEB_FONTS_DEVELOPER_API_KEY),
  ])

  const theme = ListingThemeSchema.parse(listing.theme)

  return json({
    fontFamilies: fonts.map((font) => font.family),
    listing,
    theme,
  })
}

export async function action({ context, params, request }: ActionFunctionArgs) {
  const db = context.db
  const result = zx.parseParamsSafe(params, z.object({ listingSku: z.coerce.number() }))

  if (!result.success) {
    throw badRequest({ message: result.error.message })
  }

  const sku = result.data.listingSku

  const formData = await request.formData()
  const subaction = formData.get("subaction")

  if (subaction === "ribbons") {
    const data = z.string().parse(formData.get("ribbonIds"))
    const ribbonIds = z.array(z.string()).parse(JSON.parse(data))

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

export function ErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <pre>{JSON.stringify(error.data, null, 2)}</pre>
      </div>
    )
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    )
  } else {
    return <h1>Unknown Error</h1>
  }
}

export default function DashboardListingRibbonsPage() {
  const {
    fontFamilies,
    listing: { path, ribbons },
    theme,
  } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()
  // We stringify the ribbons so we can detect if we need to reload the iframe
  const dependencyString = JSON.stringify({ ribbons, theme })

  return (
    <>
      <Tab.Group>
        <Tab.List className="mt-4 flex space-x-1 rounded-xl bg-slate-900/20 p-1">
          {["Ribbons", "Theme"].map((tab) => (
            <Tab
              className={clsx(
                "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                "ring-white/60 ring-offset-2 ring-offset-slate-400 focus:outline-none focus:ring-2",
                "ui-selected:bg-white ui-selected:text-slate-700 ui-selected:shadow",
                "text-slate-100 hover:bg-white/[0.12] hover:text-white",
              )}
              key={tab}
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>
        <div className="mt-4 grid grid-cols-5 gap-x-4 rounded-xl bg-white p-6">
          <div className="col-span-3">
            <Tab.Panels>
              <Tab.Panel>
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
                    <PageRibbons
                      onMove={(ribbonIds) =>
                        fetcher.submit(
                          {
                            ribbonIds: JSON.stringify(ribbonIds),
                            subaction: "ribbons",
                          },
                          { method: "post" },
                        )
                      }
                      ribbons={ribbons}
                    />
                  </DndProvider>
                )}
              </Tab.Panel>
              <Tab.Panel>
                <Form
                  className="grid grid-cols-2 gap-x-5 gap-y-3"
                  defaultValues={theme}
                  method="POST"
                  subaction="theme"
                  validator={themeValidator}
                >
                  <Input
                    description="The color used as the default background"
                    label="Background Color"
                    name="colors.background"
                    type="color"
                  />
                  <Input
                    description="The color used on the ribbon's title and buttons"
                    label="Primary Color"
                    name="colors.primary"
                    type="color"
                  />
                  <Input
                    description="The color used on the decorations and icons"
                    label="Secondary Color"
                    name="colors.secondary"
                    type="color"
                  />
                  <Input
                    description="The color used on text"
                    label="Text Color"
                    name="colors.text"
                    type="color"
                  />

                  <Autocomplete
                    description="Used on headings"
                    label="Heading Font"
                    name="fonts.heading"
                    options={fontFamilies.map((font) => ({
                      label: font,
                      value: font,
                    }))}
                  />
                  <Autocomplete
                    description="Used on body text"
                    label="Body Font"
                    name="fonts.body"
                    options={fontFamilies.map((font) => ({
                      label: font,
                      value: font,
                    }))}
                  />
                  <Switch
                    description="Use the dark logo in the footer"
                    label="Dark Logo"
                    name="darkLogo"
                  />
                  <SubmitButton className="col-span-2" loadingText="Saving...">
                    Save
                  </SubmitButton>
                </Form>
              </Tab.Panel>
            </Tab.Panels>
          </div>
          <div className="relative col-span-2">
            <div className="sticky top-20">
              <PagePreview dependencyString={dependencyString} path={path} />
            </div>
          </div>
        </div>
      </Tab.Group>

      <Outlet />
    </>
  )
}
