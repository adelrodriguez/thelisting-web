import { type I18nBase } from "~/helpers/i18n"

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS
    resources: I18nBase
  }
}
