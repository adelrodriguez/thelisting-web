import { createCookie } from "@remix-run/node"

export const i18nCookie = createCookie("i18n", { path: "/", sameSite: "lax" })
