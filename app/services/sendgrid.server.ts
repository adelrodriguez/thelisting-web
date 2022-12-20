import sendgrid from "@sendgrid/mail"

import { SENDGRID_API_KEY } from "~/config/vars.server"

sendgrid.setApiKey(SENDGRID_API_KEY)

export default sendgrid
