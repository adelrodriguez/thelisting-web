import { RemixI18Next } from "remix-i18next"

import { isDevelopment } from "~/config/vars"
import i18n from "~/i18n"
import { i18nCookie } from "~/utils/i18n"

const i18next = new RemixI18Next({
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
    debug: isDevelopment,
  },
})

export default i18next
