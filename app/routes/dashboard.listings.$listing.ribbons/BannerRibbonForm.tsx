import type { Ribbon } from "@prisma/client"
import { useFetcher } from "@remix-run/react"

import { ImageInput, Input, SubmitButton } from "~/components/form"
import {
  BannerPropertiesSchema,
  BannerSubtitleSchema,
  BannerTitleSchema,
} from "~/utils/ribbon"

export default function BannerRibbonForm({ ribbon }: { ribbon: Ribbon }) {
  const fetcher = useFetcher()
  const result = BannerPropertiesSchema.safeParse(ribbon.properties)
  let defaultValues

  if (result.success) {
    defaultValues = result.data
  }

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
        defaultValue={defaultValues?.title}
        required
        schema={BannerTitleSchema}
      />

      <Input
        label="Subtitle"
        type="text"
        name="subtitle"
        defaultValue={defaultValues?.subtitle}
        schema={BannerSubtitleSchema}
      />
      <ImageInput
        name="backgroundImage"
        defaultValue={defaultValues?.backgroundImage}
        label="Background Image"
      />
      <SubmitButton>Save</SubmitButton>
    </fetcher.Form>
  )
}
