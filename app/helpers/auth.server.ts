import type { User } from "@prisma/client"
import { Authenticator } from "remix-auth"
import { EmailLinkStrategy } from "remix-auth-email-link"

import { REMIX_AUTH_SECRET } from "~/config/env.server"
import db from "~/helpers/db.server"
import sessionStorage from "~/helpers/session.server"
import { sendLoginEmail } from "~/utils/email.server"

const auth = new Authenticator<User>(sessionStorage)

const secret = REMIX_AUTH_SECRET

auth.use(
  new EmailLinkStrategy(
    {
      secret,
      sendEmail: sendLoginEmail,
    },
    async ({ email }) => {
      const user = await db.user.findFirstOrThrow({
        where: { email },
      })

      await db.user.update({
        data: { lastLoginAt: new Date() },
        where: { id: user.id },
      })

      return user
    }
  )
)

export default auth
