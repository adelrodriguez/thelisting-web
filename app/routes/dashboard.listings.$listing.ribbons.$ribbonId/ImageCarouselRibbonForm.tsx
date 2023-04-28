import { MinusIcon } from "@heroicons/react/20/solid"
import { withZod } from "@remix-validated-form/with-zod"
import { useFieldArray } from "remix-validated-form"

import { Button } from "~/components/common"
import { Form, ImageInput, Input } from "~/components/form"
import { ImageCarouselPropertiesSchema } from "~/utils/ribbons"

const validator = withZod(ImageCarouselPropertiesSchema)

export default function ImageCarouselRibbonForm({
  properties,
  formId,
}: {
  properties: unknown
  formId: string
}) {
  const result = ImageCarouselPropertiesSchema.safeParse(properties)
  const [inputs, { push, remove }] = useFieldArray("images", {
    formId,
  })

  let defaultValues

  if (result.success) {
    defaultValues = result.data
  }

  return (
    <Form
      id={formId}
      className="flex flex-col gap-2"
      method="POST"
      validator={validator}
      defaultValues={defaultValues}
      action="?/properties"
    >
      <div className="flex gap-2">
        <Input
          name="height"
          label="Height"
          type="number"
          className="w-1/2"
          min={0}
          step={1}
          description="The height of the carousel"
        />
        <Input
          type="number"
          name="duration"
          label="Duration"
          className="w-1/2"
          description="The duration to show each image for (in seconds)"
          min={1}
          step={1}
        />
      </div>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Images</h3>
        <Button
          onClick={() => push(undefined)}
          type="button"
          size="xs"
          disabled={inputs.length >= 10}
          variant="secondary"
        >
          Add an image
        </Button>
      </div>

      <div className="flex flex-col-reverse">
        {inputs.map((_, index) => (
          <div key={`inputs${index}`} className="flex w-full items-end">
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
