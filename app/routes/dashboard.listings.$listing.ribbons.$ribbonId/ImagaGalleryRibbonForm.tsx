import { MinusIcon } from "@heroicons/react/20/solid"
import { withZod } from "@remix-validated-form/with-zod"
import { nanoid } from "nanoid"
import { useFieldArray } from "remix-validated-form"

import { Button } from "~/components/common"
import { Form, ImageInput, Input } from "~/components/form"
import { ImageGalleryPropertiesSchema } from "~/utils/ribbons"

const validator = withZod(ImageGalleryPropertiesSchema)

export default function ImageGalleryRibbonForm({
  properties,
  formId,
}: {
  properties: unknown
  formId: string
}) {
  const result = ImageGalleryPropertiesSchema.safeParse(properties)
  const [inputs, { push, remove }] = useFieldArray<{ id: string }>("images", {
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
          name="groupSize"
          label="Group Size"
          type="number"
          className="w-1/2"
          min={1}
          step={1}
          description="The number of images to display per column."
        />
      </div>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Images</h3>
        <Button
          onClick={() => push({ id: nanoid() })}
          type="button"
          size="xs"
          disabled={inputs.length >= 10}
          variant="secondary"
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
