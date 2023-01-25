import type { User } from "@prisma/client"
import type { SendEmailOptions } from "remix-auth-email-link"

import { MagicLinkEmail } from "~/components/email"
import { LOGIN_SENDER_EMAIL } from "~/config/env.server"
import resend from "~/services/resend.server"

export async function sendLoginEmail({
  emailAddress,
  magicLink,
  user,
}: SendEmailOptions<User>): Promise<void> {
  if (!user) throw new Error("User does not exist")

  await resend.sendEmail({
    from: LOGIN_SENDER_EMAIL,
    react: <MagicLinkEmail magicLink={magicLink} user={user} />,
    subject: "Here's your login link",
    to: emailAddress,
  })
}
