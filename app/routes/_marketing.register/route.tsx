import { Widget } from "@typeform/embed-react"

import { REGISTRATION_TYPEFORM_ID } from "~/config/consts"

export default function Page() {
  return <Widget className="h-screen py-20" id={REGISTRATION_TYPEFORM_ID} />
}
