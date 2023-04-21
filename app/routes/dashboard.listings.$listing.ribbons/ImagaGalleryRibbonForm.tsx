import { MinusIcon } from "@heroicons/react/20/solid"
import { createId } from "@paralleldrive/cuid2"
import type { Ribbon } from "@prisma/client"
import { useFetcher } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { useFieldArray } from "remix-validated-form"

import { Button } from "~/components/common"
import { Form, ImageInput, Input } from "~/components/form"
import { ImageGalleryPropertiesSchema } from "~/utils/ribbons"

const validator = withZod(ImageGalleryPropertiesSchema)

export default function ImageGalleryRibbonForm({
  ribbon,
  id,
}: {
  ribbon: Ribbon
  id: string
}) {
  const fetcher = useFetcher()
  const result = ImageGalleryPropertiesSchema.safeParse(ribbon.properties)
  const [inputs, { push, remove }] = useFieldArray<{ id: string }>("images", {
    formId: id,
  })

  let defaultValues

  if (result.success) {
    defaultValues = result.data
  }

  return (
    <Form
      id={id}
      className="flex flex-col gap-2"
      action={`/api/ribbons/${ribbon.id}/properties`}
      method="POST"
      validator={validator}
      defaultValues={defaultValues}
      fetcher={fetcher}
    >
      <div className="flex gap-2">
        <Input
          name="groupSize"
          label="Group Size"
          type="number"
          className="w-1/2"
          min={1}
          step={1}
          description="The height of the carousel"
        />
      </div>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Images</h3>
        <Button
          onClick={() => push({ id: createId() })}
          type="button"
          size="xs"
          disabled={inputs.length >= 10}
        >
          Add an image
        </Button>
      </div>

      <div className="flex flex-col-reverse">
        {inputs.map((input, index) => (
          <div key={`inputs${input.id}`} className="flex w-full items-end">
            <ImageInput
              name={`images[${index}]`}
              label={`Image ${index + 1}`}
              className="mr-2 w-full"
            />
            <Button
              onClick={() => remove(index)}
              className="my-1"
              variant="secondary"
              type="button"
            >
              <MinusIcon className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>
    </Form>
  )
}
