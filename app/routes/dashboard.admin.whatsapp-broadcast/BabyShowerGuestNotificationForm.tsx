import { withZod } from "@remix-validated-form/with-zod"
import { useFormContext } from "remix-validated-form"
import { z } from "zod"

import { Alert, Dropzone } from "~/components/common"
import {
  Form,
  ImageInput,
  Input,
  InputWithAddOn,
  SubmitButton,
} from "~/components/form"
import { HOMEPAGE_URL } from "~/config/consts"
import { useCSVParser } from "~/utils/hooks"

export const validator = withZod(
  z.object({
    customer: z.string().min(1),
    image: z.string().uuid("You must provide an image"),
    path: z.string().min(1),
    phoneNumbers: z
      .array(z.string().min(1).trim())
      .min(1, { message: "You must provide at least one phone number" }),
  }),
)

const HEADERS = ["phoneNumber"]

function transformHeader(header: string, index: number) {
  return HEADERS[index] ?? header
}

export default function BabyShowerGuestNotificationForm() {
  const { parse, reset, result } = useCSVParser<{ phoneNumber: string }>({
    header: true,
    transformHeader,
  })
  const { fieldErrors } = useFormContext("babyShowerGuestNotification")

  return (
    <Form
      className="flex flex-col gap-y-6"
      id="babyShowerGuestNotification"
      method="POST"
      onReset={reset}
      resetAfterSubmit
      validator={validator}
    >
      <InputWithAddOn addOn={HOMEPAGE_URL + "/"} label="Path" name="path" />
      <Input
        description="The name of the customer(s) (e.g. José y María)"
        label="Customer"
        name="customer"
      />
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {result?.data.map((row) => (
                <tr key={row.phoneNumber}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                    {row.phoneNumber}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Dropzone
          accept={{ "text/csv": [".csv"] }}
          fileUploadLimitDescription="CSV files up to 10MB"
          name="data-upload"
          onDrop={(files) => {
            if (files[0]) {
              parse(files[0])
            }
          }}
          title="Upload the CSV file with the phone numbers"
        />
      )}

      {result?.data.map((row, index) => (
        <div className="hidden" key={index}>
          <Input
            label="Phone Number"
            name={`phoneNumbers[${index}]`}
            type="hidden"
            value={row.phoneNumber}
          />
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
