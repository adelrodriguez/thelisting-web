import CallToAction from "./CallToAction"
import Features from "./Features"
import Hero from "./Hero"
import Highlights from "./Highlights"
import Testimonials from "./Testimonials"

export const handle = { i18n: "home" }

export default function MarketingIndex() {
  return (
    <>
      <Hero />
      <Features />
      <Highlights />
      <Testimonials />
      <CallToAction />
    </>
  )
}
