import sendgrid from "@sendgrid/mail"

import { SENDGRID_API_KEY } from "~/config/env.server"

sendgrid.setApiKey(SENDGRID_API_KEY)

export default sendgrid
