import { Dialog, Transition } from "@headlessui/react"
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline"
import { withZod } from "@remix-validated-form/with-zod"
import { Fragment } from "react"
import { ValidatedForm } from "remix-validated-form"
import { z } from "zod"

import { FormInput, FormSubmit } from "~/components/form"
import {
  useScrapedProducts,
  Headers,
} from "~/routes/dashboard.admin.product-scraper/route"
import { downloadAsCSVFile } from "~/utils/csv"
import { useDialogPage } from "~/utils/hooks"

const ExportCSVSchema = z.object({
  filename: z.string().min(1),
})

const validator = withZod(ExportCSVSchema)

export default function ExportCSVPage() {
  const { open, close, leave } = useDialogPage()
  const { products } = useScrapedProducts()

  return (
    <Transition.Root appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={leave}
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <ArrowDownTrayIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <Dialog.Title
                  as="h3"
                  className="mt-3 text-center text-lg font-medium leading-6 text-gray-900"
                >
                  Export your CSV file
                </Dialog.Title>
                <ValidatedForm
                  className="mt-5"
                  validator={validator}
                  onSubmit={async (data) => {
                    downloadAsCSVFile(data.filename, products, {
                      columns: Headers.map((header) => header), // Mapping the headers to the columns (to avoid the "scrapedProductId" column)
                    })
                    close()
                  }}
                >
                  <div className="mt-2">
                    <FormInput
                      name="filename"
                      label="Filename"
                      placeholder="my-csv-file.csv"
                    />
                  </div>
                  <div className="mt-4 sm:mt-5">
                    <FormSubmit
                      className="w-full"
                      text="Download"
                      loadingText="Downloading..."
                    />
                  </div>
                </ValidatedForm>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
