import {
  BellAlertIcon,
  CakeIcon,
  CurrencyDollarIcon,
  CursorArrowRaysIcon,
} from "@heroicons/react/20/solid"
import { useTranslation } from "react-i18next"

const features = [
  {
    description: "landing.features.list.0.description",
    icon: BellAlertIcon,
    title: "landing.features.list.0.title",
  },
  {
    description: "landing.features.list.1.description",
    icon: CursorArrowRaysIcon,
    title: "landing.features.list.1.title",
  },
  {
    description: "landing.features.list.2.description",
    icon: CurrencyDollarIcon,
    title: "landing.features.list.2.title",
  },
  {
    description: "landing.features.list.3.description",
    icon: CakeIcon,
    title: "landing.features.list.3.title",
  },
] as const

export default function Features() {
  const { t } = useTranslation("marketing")
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-slate-600">
            {t("landing.features.title")}
          </h2>
          <p className="mt-2 font-headline text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            {t("landing.features.subtitle")}
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {t("landing.features.description")}
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div className="relative pl-16" key={feature.title}>
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-600">
                    <feature.icon aria-hidden="true" className="h-6 w-6 text-white" />
                  </div>
                  {t(feature.title)}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">{t(feature.description)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
