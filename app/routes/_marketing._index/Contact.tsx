import { Link } from "@remix-run/react"
import { useTranslation } from "react-i18next"
import { route } from "routes-gen"

export default function Contact() {
  const { t } = useTranslation("marketing")

  return (
    <section className="bg-white" id="contact">
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:pb-32">
        <h2 className="font-headline text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          <span className="block">{t("landing.contact.title1")}</span>
          <span className="block">{t("landing.contact.title2")}</span>
        </h2>
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-md shadow">
            <Link
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-slate-600 px-5 py-3 text-base font-medium text-white hover:bg-slate-700"
              to={route("/register")}
            >
              {t("landing.contact.register")}
            </Link>
          </div>
          <div className="ml-3 inline-flex">
            <Link
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-gray-100 px-5 py-3 text-base font-medium text-slate-700 hover:bg-gray-200"
              to="mailto:hola@thelisting.do"
            >
              {t("landing.contact.contact_us")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
