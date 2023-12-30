import { Dialog, Transition } from "@headlessui/react"
import { TagIcon } from "@heroicons/react/24/outline"
import { useNavigate, useNavigation, useParams } from "@remix-run/react"
import { Fragment, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { RouteParams, route } from "routes-gen"

import { Button } from "~/components/common"
import { Spinner } from "~/components/loading"
import { useCart } from "~/utils/hooks"
import { RouteHandle } from "~/utils/remix"

export const handle: RouteHandle = {
  i18n: ["registry", "common"],
  id: "listing-cart-confirm",
}

export default function Page() {
  const navigate = useNavigate()
  const navigation = useNavigation()
  const cart = useCart()
  const { t } = useTranslation("registry")
  const confirmButtonRef = useRef(null)
  const [open, isOpen] = useState(true)
  const { listing } = useParams<RouteParams["/:listing/cart/confirm"]>()
  const isSubmitting = navigation.state === "submitting"

  if (!listing) return null

  return (
    <Transition.Root appear as={Fragment} show={open}>
      <Dialog
        as="div"
        className="relative z-30"
        initialFocus={confirmButtonRef}
        onClose={() => isOpen(false)}
      >
        <Transition.Child
          afterLeave={() => navigate(route("/:listing/cart", { listing }))}
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                    <TagIcon
                      aria-hidden="true"
                      className="h-6 w-6 text-rose-600"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-slate-900"
                    >
                      {t("addNoteReminder.title")}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-slate-500">
                        {t("addNoteReminder.description")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <Button
                    disabled={isSubmitting}
                    onClick={() => {
                      navigate(route("/:listing/cart/note", { listing }), {
                        replace: true,
                      })
                    }}
                    ref={confirmButtonRef}
                    type="button"
                    variant="secondary"
                  >
                    {t("addNoteReminder.confirm")}
                  </Button>
                  <Button
                    disabled={isSubmitting}
                    onClick={() => cart.checkout()}
                    type="button"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner className="h-5 w-5 text-slate-900" />
                        {t("addNoteReminder.loading")}
                      </>
                    ) : (
                      t("addNoteReminder.cancel")
                    )}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
