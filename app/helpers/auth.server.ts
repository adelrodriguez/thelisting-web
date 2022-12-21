import type { User } from "@prisma/client"
import { Authenticator } from "remix-auth"
import { EmailLinkStrategy } from "remix-auth-email-link"

import { REMIX_AUTH_SECRET } from "~/config/vars.server"
import db from "~/helpers/db.server"
import { sendLoginEmail } from "~/helpers/email.server"
import sessionStorage from "~/helpers/session.server"

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

      return user
    }
  )
)

export default auth
