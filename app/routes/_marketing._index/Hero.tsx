import { Link } from "@remix-run/react"
import { useTranslation } from "react-i18next"
import { route } from "routes-gen"

export default function Hero() {
  const { t } = useTranslation("marketing")

  return (
    <section className="relative isolate overflow-hidden bg-white">
      {/* We're adding an extra pixel due to a bug in Safari */}
      <div className="position absolute -z-10 h-[calc(100%+1px)] w-full bg-[url('/assets/images/bottom-curve.svg')] bg-contain bg-bottom bg-no-repeat" />

      <img
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        // TODO(adelrodriguez): Replace this image with a real one
        src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
      />
      <div className="absolute inset-0 -z-20 h-full w-full bg-gray-600 object-cover mix-blend-multiply" />

      <div className="px-6 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="font-heading text-6xl font-bold tracking-tight text-white sm:text-6xl">
              {t("landing.hero.title")}
            </h1>
            <p className="mt-6 font-body text-xl font-light leading-8 text-gray-300">
              {t("landing.hero.subtitle")}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-slate-600 px-5 py-3 text-base font-medium text-white hover:bg-slate-700"
                to={route("/register")}
              >
                {t("landing.hero.cta")}{" "}
              </Link>

              <Link
                className="text-base font-semibold leading-7 text-white "
                to={route("/search")}
              >
                {t("landing.hero.find")} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
