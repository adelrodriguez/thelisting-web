import { withZod } from "@remix-validated-form/with-zod"
import { useFormContext } from "remix-validated-form"
import { z } from "zod"

import { Alert, Dropzone } from "~/components/common"
import { Form, ImageInput, Input, InputWithAddOn, SubmitButton, TextArea } from "~/components/form"
import { REDIRECT_URL } from "~/config/consts"
import { useCSVParser } from "~/utils/hooks"

export const validator = withZod(
  z.object({
    coupleName: z.string().min(1),
    date: z.string().min(1),
    image: z.string().url("You must provide an image"),
    message: z.string().min(1).max(1024),
    path: z.string().min(1),
    place: z.string().min(1),
    recipients: z
      .array(
        z.object({
          name: z.string().min(1),
          phoneNumber: z.string().min(1).trim(),
        }),
      )
      .min(1, { message: "You must provide at least one phone number" }),
  }),
)

const HEADERS = ["phoneNumber", "name"]

function transformHeader(header: string, index: number) {
  return HEADERS[index] ?? header
}

export default function WeddingInvitationV1Form() {
  const { parse, reset, result } = useCSVParser<{
    phoneNumber: string
    name: string
  }>({
    header: true,
    transformHeader,
  })
  const { fieldErrors } = useFormContext("weddingInvitationV1")

  return (
    <Form
      className="flex flex-col gap-y-6"
      id="weddingInvitationV1"
      method="POST"
      onReset={reset}
      resetAfterSubmit
      validator={validator}
    >
      <InputWithAddOn addOn={REDIRECT_URL + "/"} label="Path" name="path" />
      <Input
        description="The name of the couple getting married (e.g. John & Jane)"
        label="Couple Name"
        name="coupleName"
      />
      <Input description="The date of the event" label="Date" name="date" />
      <Input description="Where the event takes place" label="Place" name="place" />
      <TextArea description="A custom message" label="Message" name="message" />
      <ImageInput
        description="The image to attach to the message"
        label="Message Image"
        name="image"
      />

      {result ? (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  scope="col"
                >
                  Phone Number
                </th>
                <th
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  scope="col"
                >
                  Name
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {result.data.map((row) => (
                <tr key={row.phoneNumber}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                    {row.phoneNumber}
                  </td>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                    {row.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Dropzone
          accept={{ "text/csv": [".csv"] }}
          fileUploadLimitDescription="First column must be the phone number, second column must be the recipient name. CSV files up to 10MB"
          name="data-upload"
          onDrop={(files) => {
            if (files[0]) {
              parse(files[0])
            }
          }}
          title="Upload the CSV file with the recipient names and phone numbers"
        />
      )}

      {result?.data.map((row, index) => (
        <div className="hidden" key={index}>
          <Input
            label="Phone Number"
            name={`recipients[${index}].phoneNumber`}
            type="hidden"
            value={row.phoneNumber}
          />
          <Input label="Name" name={`recipients[${index}].name`} type="hidden" value={row.name} />
        </div>
      ))}

      {Object.keys(fieldErrors).length > 0 && (
        <Alert type="error">
          Please fix the errors in the form.
          <pre className="text-wrap">{JSON.stringify(fieldErrors)}</pre>
        </Alert>
      )}

      <SubmitButton loadingText="Sending...">Send</SubmitButton>
    </Form>
  )
}
