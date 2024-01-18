import { MinusIcon } from "@heroicons/react/20/solid"
import { Ribbon, RibbonType } from "@prisma/client"
import { SerializeFrom } from "@remix-run/node"
import { withZod } from "@remix-validated-form/with-zod"
import { useFieldArray } from "remix-validated-form"

import { Button } from "~/components/common"
import { Form, ImageInput, Input } from "~/components/form"
import { ImageCarouselRibbon } from "~/utils/ribbons"

const validator = withZod(ImageCarouselRibbon)

export default function ImageCarouselRibbonForm({
  formId,
  ribbon,
}: {
  ribbon: SerializeFrom<Ribbon> // Serialized ribbon coming from loader
  formId: string
}) {
  const result = ImageCarouselRibbon.safeParse(ribbon)
  const [inputs, { push, remove }] = useFieldArray("images", {
    formId,
  })

  let defaultValues

  if (result.success) {
    defaultValues = result.data
  }

  return (
    <Form
      className="flex flex-col gap-2"
      defaultValues={defaultValues}
      id={formId}
      method="POST"
      subaction="update"
      validator={validator}
    >
      <input name="id" type="hidden" />
      <input name="type" type="hidden" value={RibbonType.ImageCarousel} />
      <input name="position" type="hidden" />

      <Input
        description="The name of the ribbon, as it will appear on the menu"
        label="Name"
        name="name"
      />

      <div className="flex gap-2">
        <Input
          className="w-1/2"
          description="The height of the carousel"
          label="Height"
          min={0}
          name="properties.height"
          step={1}
          type="number"
        />
        <Input
          className="w-1/2"
          description="The duration to show each image for (in seconds)"
          label="Duration"
          min={1}
          name="properties.duration"
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
              name={`properties.images[${index}]`}
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
