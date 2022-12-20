import type { User } from "@prisma/client"
import type { SendEmailOptions } from "remix-auth-email-link"

import { SENDGRID_SENDER_EMAIL } from "~/config/vars.server"
import sendgrid from "~/services/sendgrid.server"

export async function sendLoginEmail({
  emailAddress,
  magicLink,
  user,
}: SendEmailOptions<User>) {
  // TODO(adelrodriguez): If user exists, send login template
  // TODO(adelrodriguez): If user doesn't exist, send signup template
  const subject = "Here's your login link"
  const to = emailAddress
  const from = SENDGRID_SENDER_EMAIL
  const html = `
  <p>
  Hi ${user?.email || "no@email.com"},<br />
  <br />
  <a href="${magicLink}">Click here to login on example.app</a>
</p>
  `

  // TODO(adelrodriguez): Add to queue instead of sending directly
  await sendgrid.send({ from, html, subject, to })
}
