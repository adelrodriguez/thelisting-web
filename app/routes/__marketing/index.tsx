import { useTranslation } from "react-i18next"

import {
  About,
  CallToAction,
  Features,
  Hero,
  Testimonials,
} from "~/components/marketing"

export const handle = { i18n: "home" }

export default function MarketingIndex() {
  const { t } = useTranslation("home")

  return (
    <>
      <Hero
        title={t("hero.h1")}
        subtitle={t("hero.h2")}
        cta={t("hero.cta")}
        searchText={t("hero.findARegistry")}
      />
      <About />
      <Features />
      <Testimonials />
      <CallToAction />
    </>
  )
}
