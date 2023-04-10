import type { Ribbon } from "@prisma/client"
import { useFetcher } from "@remix-run/react"

import { Input, SubmitButton } from "~/components/form"
import {
  BannerPropertiesSchema,
  BannerSubtitleSchema,
  BannerTitleSchema,
} from "~/utils/ribbon"

export default function BannerRibbonForm({ ribbon }: { ribbon: Ribbon }) {
  const fetcher = useFetcher()
  const result = BannerPropertiesSchema.safeParse(ribbon.properties)

  return (
    <fetcher.Form
      className="flex flex-col gap-2"
      action={`/api/ribbons/${ribbon.id}/properties`}
      method="post"
    >
      <Input
        label="Title"
        type="text"
        name="title"
        defaultValue={result.success ? result.data.title : ""}
        required
        schema={BannerTitleSchema}
      />

      <Input
        label="Subtitle"
        type="text"
        name="subtitle"
        defaultValue={(result.success && result.data.subtitle) || ""}
        schema={BannerSubtitleSchema}
      />
      <SubmitButton>Save</SubmitButton>
    </fetcher.Form>
  )
}
