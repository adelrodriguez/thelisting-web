import { Outlet } from "@remix-run/react"
import { useTranslation } from "react-i18next"

import { LayoutHeader, LayoutFooter } from "~/components/marketing"

const headerNavigation = [
  { href: "/pricing", key: "navigation.pricing" },
  { href: "/about", key: "navigation.about" },
  { href: "#", key: "navigation.examples" },
  { href: "#", key: "navigation.faq" },
  { href: "#", key: "navigation.contact" },
]

export const handle = { i18n: "common" }

export default function MarketingLayout() {
  const { t } = useTranslation("common")

  return (
    <>
      <LayoutHeader
        navigationItems={headerNavigation.map((item) => ({
          ...item,
          key: t(item.key),
        }))}
        loginText={t("login")}
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <LayoutFooter />
    </>
  )
}
