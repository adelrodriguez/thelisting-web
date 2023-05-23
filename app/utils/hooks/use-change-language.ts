import { useEffect } from "react"
import { useTranslation } from "react-i18next"

// TODO(adelrodriguez): This hook is a temporary solution to change the language
/// until https://github.com/sergiodxa/remix-i18next/issues/107 gets fixed.
export default function useChangeLanguage(locale: string) {
  const { i18n } = useTranslation()

  useEffect(() => {
    void i18n.changeLanguage(locale)
  }, [locale, i18n])
}
