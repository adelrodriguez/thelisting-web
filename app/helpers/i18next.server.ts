import Backend from "i18next-fs-backend"
import { resolve } from "node:path"
import { RemixI18Next } from "remix-i18next"

import { isDevelopment } from "~/config/vars"
import i18n from "~/i18n"
import { i18nCookie } from "~/utils/i18next"

const i18next = new RemixI18Next({
  // The backend you want to use to load the translations Tip: You could pass
  // `resources` to the `i18next` configuration and avoid a backend here
  backend: Backend,
  detection: {
    cookie: i18nCookie,
    fallbackLanguage: i18n.fallbackLng,
    order: ["searchParams", "cookie"],
    supportedLanguages: i18n.supportedLngs,
  },
  // This is the configuration for i18next used when translating messages
  // server-side only
  i18next: {
    ...i18n,
    backend: {
      loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json"),
    },
    debug: isDevelopment,
  },
})

export default i18next
