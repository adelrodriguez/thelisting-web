import { createCookieSessionStorage } from "@remix-run/node"
import { z } from "zod"

import { ONE_WEEK } from "~/config/consts"
import { REMIX_AUTH_SECRET } from "~/config/env.server"
import { isProduction } from "~/config/vars"

const sessionStorage = createCookieSessionStorage<Session>({
  cookie: {
    httpOnly: true,
    maxAge: 2 * ONE_WEEK.inSeconds, // two weeks
    name: "thelisting", // use any name you want here
    path: "/", // remember to add this so the cookie will work in all routes
    sameSite: "lax", // this helps with CSRF
    secrets: [REMIX_AUTH_SECRET],
    secure: isProduction, // enable this in prod only
  },
})

const SessionSchema = z
  .object({
    "auth:email": z.string().optional(),
    "auth:error": z.any().optional(),
    "auth:magiclink": z.string().optional(),
    cartsKey: z.string().optional(), // The key used to identify the user's cart in Redis
    user: z.any().optional(), // TODO(adelrodriguez): add typing
  })
  .passthrough()
export type Session = z.infer<typeof SessionSchema>

// you can also export the methods individually for your own usage
export const { commitSession, destroySession, getSession } = sessionStorage

export { SessionSchema }
export default sessionStorage
