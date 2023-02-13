import { createCookieSessionStorage } from "@remix-run/node"
import { add } from "date-fns"
import { createTypedSessionStorage } from "remix-utils"
import { z } from "zod"

import { REMIX_AUTH_SECRET } from "~/config/env.server"
import { isProduction } from "~/config/vars"

const sessionStorage = createCookieSessionStorage({
  cookie: {
    expires: add(new Date(), { days: 30 }), // expire in 30 days
    httpOnly: true,
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

const typedSessionStorage = createTypedSessionStorage({
  schema: SessionSchema,
  sessionStorage,
})

// you can also export the methods individually for your own usage
export const { getSession, commitSession, destroySession } = typedSessionStorage

export default typedSessionStorage
