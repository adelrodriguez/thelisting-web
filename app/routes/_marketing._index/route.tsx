import Contact from "./Contact"
import Examples from "./Examples"
import FAQ from "./FAQ"
import Features from "./Features"
import Hero from "./Hero"
import Highlight from "./Highlight"
import Pricing from "./Pricing"
import Testimonials from "./Testimonials"

export default function Page() {
  return (
    <>
      <Hero />
      <Highlight />
      <Features />
      <Testimonials />
      <Examples />
      <Pricing />
      <FAQ />
      <Contact />
    </>
  )
}
