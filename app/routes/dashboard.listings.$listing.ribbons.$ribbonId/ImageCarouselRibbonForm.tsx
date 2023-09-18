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
      action="?/properties"
      className="flex flex-col gap-2"
      defaultValues={defaultValues}
      id={formId}
      method="POST"
      validator={validator}
    >
      <div className="flex gap-2">
        <Input
          className="w-1/2"
          description="The height of the carousel"
          label="Height"
          min={0}
          name="height"
          step={1}
          type="number"
        />
        <Input
          className="w-1/2"
          description="The duration to show each image for (in seconds)"
          label="Duration"
          min={1}
          name="duration"
          step={1}
          type="number"
        />
      </div>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Images</h3>
        <Button
          disabled={inputs.length >= 10}
          onClick={() => push(undefined)}
          size="xs"
          type="button"
          variant="secondary"
        >
          Add an image
        </Button>
      </div>

      <div className="flex flex-col-reverse">
        {inputs.map((_, index) => (
          <div className="flex w-full items-end" key={`inputs${index}`}>
            <ImageInput
              className="mr-2 w-full"
              label={`Image ${index + 1}`}
              name={`images[${index}]`}
            />
            <Button
              className="my-1"
              onClick={() => remove(index)}
              type="button"
              variant="secondary"
            >
              <MinusIcon className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>
    </Form>
  )
}
