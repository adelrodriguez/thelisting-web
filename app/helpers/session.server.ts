import { createCookieSessionStorage } from "@remix-run/node"

import { REMIX_AUTH_SECRET, isProduction } from "~/config/vars.server"

const sessionStorage = createCookieSessionStorage({
  cookie: {
    httpOnly: true,
    name: "the-listing", // use any name you want here
    path: "/", // remember to add this so the cookie will work in all routes
    sameSite: "lax", // this helps with CSRF
    secrets: [REMIX_AUTH_SECRET],
    secure: isProduction, // enable this in prod only
  },
})

// you can also export the methods individually for your own usage
export const { getSession, commitSession, destroySession } = sessionStorage

export default sessionStorage
