import { Link } from "@remix-run/react"
import type { SVGProps } from "react"
import { useTranslation } from "react-i18next"

import { LanguageCurrencySelector } from "~/components/marketing"
import { THE_LISTING_LOGO_WHITE } from "~/config/consts"

const navigation = {
  legal: [
    { href: "/legal#terms", key: "marketing:footer.legal.terms" },
    { href: "/legal#privacy", key: "marketing:footer.legal.privacy" },
    { href: "/legal#security", key: "marketing:footer.legal.security" },
    { href: "/legal#refunds", key: "marketing:footer.legal.refunds" },
  ] as const,
  social: [
    {
      href: "https://wa.me/18093304425",
      icon: (props: SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            clipRule="evenodd"
            d="m.057 24 1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"
            fillRule="evenodd"
          />
        </svg>
      ),
      name: "WhatsApp",
    },
    {
      href: "https://instagram.com/thelisting.do",
      icon: (props: SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            clipRule="evenodd"
            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
            fillRule="evenodd"
          />
        </svg>
      ),
      name: "Instagram",
    },
    {
      href: "https://www.facebook.com/thelisting.do/",
      icon: (props: SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            clipRule="evenodd"
            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
            fillRule="evenodd"
          />
        </svg>
      ),
      name: "Facebook",
    },
    {
      href: "https://www.pinterest.com/giftthelisting/",
      icon: (props: SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 54 54" {...props}>
          <path d="M-.2.1h53.8v53.4H-.2z" fill="none" />
          <path d="M45.2 15.5c1.9 3.3 2.9 6.9 2.9 10.8s-1 7.5-2.9 10.8c-1.9 3.3-4.5 5.9-7.8 7.8-3.3 1.9-6.9 2.9-10.8 2.9-2.1 0-4.1-.3-6.1-.9 1.1-1.7 1.8-3.3 2.2-4.6.2-.6.7-2.6 1.5-5.9.4.7 1.1 1.4 2 1.9 1 .5 2 .8 3.2.8 2.3 0 4.3-.6 6-1.9 1.8-1.3 3.1-3 4.1-5.3 1-2.2 1.5-4.7 1.5-7.5 0-2.1-.6-4.1-1.7-6-1.1-1.9-2.7-3.4-4.8-4.5s-4.4-1.9-7-1.9c-2 0-3.8.3-5.5.8-1.7.5-3.1 1.3-4.3 2.1-1.2.9-2.2 1.9-3 3.1-.8 1.2-1.5 2.4-1.9 3.6-.4 1.2-.6 2.5-.6 3.7 0 1.9.4 3.6 1.1 5.1.7 1.5 1.8 2.5 3.3 3.1.6.2.9 0 1.1-.6 0-.1.1-.4.2-.9.1-.4.2-.7.2-.8.1-.4 0-.8-.3-1.2-.9-1.1-1.4-2.5-1.4-4.2 0-2.8 1-5.2 2.9-7.2s4.5-3 7.6-3c2.8 0 5 .8 6.6 2.3 1.6 1.5 2.4 3.5 2.4 5.9 0 3.2-.6 5.9-1.9 8.1-1.3 2.2-2.9 3.3-4.9 3.3-1.1 0-2-.4-2.7-1.2-.7-.8-.9-1.8-.6-2.9.1-.7.4-1.5.7-2.6.3-1.1.6-2 .8-2.9.2-.8.3-1.5.3-2.1 0-.9-.3-1.7-.8-2.3-.5-.6-1.2-.9-2.1-.9-1.2 0-2.1.5-2.9 1.6-.8 1.1-1.2 2.4-1.2 4 0 1.4.2 2.5.7 3.4L18.4 41c-.3 1.3-.4 2.9-.4 4.9-3.8-1.7-6.9-4.3-9.3-7.8s-3.5-7.5-3.5-11.8c0-3.9 1-7.5 2.9-10.8 1.9-3.3 4.5-5.9 7.8-7.8 3.3-1.9 6.9-2.9 10.8-2.9 3.9 0 7.5 1 10.8 2.9s5.8 4.5 7.7 7.8z" />
        </svg>
      ),
      name: "Pinterest",
    },
  ],
}

export default function Footer() {
  const { t } = useTranslation(["marketing", "common"])

  return (
    <footer className="bg-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <h2 className="sr-only">Footer</h2>
        <div className="pb-8 md:grid md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="mt-12 flex items-center justify-center md:mt-0">
            <div className="flex flex-col items-center justify-center gap-y-1 text-center">
              <img alt="" className="mb-4 h-16 object-contain" src={THE_LISTING_LOGO_WHITE} />
              <p className="text-xs text-gray-300">Calle 11 #12, Sector Julieta</p>
              <p className="text-xs text-gray-300">Santo Domingo, República Dominicana</p>
              <Link className="text-xs text-gray-300" to="mailto:hola@thelisting.do">
                hola@thelisting.do
              </Link>
              <Link className="text-xs text-gray-300" to="tel:18093304425">
                +1 (809) 330-4425
              </Link>
            </div>
          </div>
          <div className="mt-12 md:mt-0">
            <div className="flex flex-col items-center justify-around">
              <svg
                className="h-20 w-20"
                viewBox="0 0 152.4 108"
                xmlSpace="preserve"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0 0h152.4v108H0z" fill="none" />
                <path d="M60.4 25.7h31.5v56.6H60.4z" fill="#ff5f00" />
                <path
                  d="M62.4 54c0-11 5.1-21.5 13.7-28.3-15.6-12.3-38.3-9.6-50.6 6.1C13.3 47.4 16 70 31.7 82.3c13.1 10.3 31.4 10.3 44.5 0C67.5 75.5 62.4 65 62.4 54z"
                  fill="#eb001b"
                />
                <path
                  d="M134.4 54c0 19.9-16.1 36-36 36-8.1 0-15.9-2.7-22.2-7.7 15.6-12.3 18.3-34.9 6-50.6-1.8-2.2-3.8-4.3-6-6 15.6-12.3 38.3-9.6 50.5 6.1 5 6.3 7.7 14.1 7.7 22.2z"
                  fill="#f79e1b"
                />
              </svg>
              <svg
                className="h-20 w-20"
                viewBox="0 0 1000.046 323.653"
                xmlSpace="preserve"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M433.352 318.984h-81.01l50.67-313.305h81.006zM727.023 13.339c-15.978-6.34-41.322-13.34-72.66-13.34-80 0-136.336 42.661-136.682 103.653-.664 45 40.335 69.994 71 84.998 31.341 15.332 41.995 25.34 41.995 39.006-.319 20.989-25.326 30.664-48.65 30.664-32.343 0-49.673-4.988-76.009-16.666l-10.667-5.005-11.337 70.33c19 8.656 54.006 16.337 90.35 16.674 85.002 0 140.34-42 140.996-106.997.324-35.666-21.326-62.994-68-85.325-28.334-14.336-45.686-24.002-45.686-38.67.332-13.334 14.677-26.991 46.661-26.991 26.336-.67 45.686 5.661 60.345 11.996l7.327 3.327 11.017-67.654zM834.694 207.991c6.671-17.999 32.343-87.66 32.343-87.66-.337.669 6.658-18.331 10.658-29.995l5.662 26.996s15.34 74.995 18.672 90.66h-67.335zM934.69 5.68H872.03c-19.323 0-34.004 5.662-42.341 25.995L709.357 318.98h85.002s13.994-38.669 17.002-46.997h104.011c2.326 11 9.666 46.997 9.666 46.997h75.008L934.691 5.68zM284.678 5.68l-79.336 213.643-8.67-43.33C182.006 125.997 136.005 71.677 84.67 44.667l72.669 273.985h85.667L370.34 5.679h-85.662z"
                  fill="#00579f"
                />
                <path
                  d="M131.672 5.68H1.333L0 12.01c101.672 25.999 169.008 88.67 196.673 163.997L168.339 32.015c-4.665-20.01-19-25.676-36.667-26.336z"
                  fill="#faa61a"
                />
              </svg>
            </div>
          </div>
          <div className="mt-12 md:mt-0">
            <h3 className="text-base font-medium text-white">
              {t("marketing:footer.legal.title")}
            </h3>
            <ul className="mt-4 space-y-4">
              {navigation.legal.map((item) => (
                <li key={item.key}>
                  <Link className="text-base text-gray-300 hover:text-white" to={item.href}>
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-12 sm:max-w-xs lg:mt-0">
            <h3 className="text-base font-medium text-white">{t("common:language_currency")}</h3>
            <LanguageCurrencySelector />
          </div>
        </div>

        <div className="mt-8 border-t border-slate-700 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            {navigation.social.map((item) => (
              <Link className="text-gray-400 hover:text-gray-300" key={item.name} to={item.href}>
                <span className="sr-only">{item.name}</span>
                <item.icon aria-hidden="true" className="h-6 w-6" />
              </Link>
            ))}
          </div>
          <p className="mt-8 text-base text-gray-400 md:order-1 md:mt-0">
            &copy; {new Date().getFullYear()} The Listing SRL
          </p>
        </div>
      </div>
    </footer>
  )
}
