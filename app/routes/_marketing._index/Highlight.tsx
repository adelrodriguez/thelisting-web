import {
  GiftIcon,
  PaintBrushIcon,
  SparklesIcon,
} from "@heroicons/react/20/solid"
import { useTranslation } from "react-i18next"

const features = [
  {
    description: "landing.highlight.features.0.description",
    icon: GiftIcon,
    title: "landing.highlight.features.0.title",
  },
  {
    description: "landing.highlight.features.1.description",
    icon: PaintBrushIcon,
    title: "landing.highlight.features.1.title",
  },
  {
    description: "landing.highlight.features.2.description",
    icon: SparklesIcon,
    title: "landing.highlight.features.2.title",
  },
] as const

export default function Highlight() {
  const { t } = useTranslation("marketing")

  return (
    <div className="overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base font-semibold leading-7 text-slate-600">
                {t("landing.highlight.title")}
              </h2>
              <p className="mt-2 font-headline text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                {t("landing.highlight.subtitle")}
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                {t("landing.highlight.description")}
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                {features.map((feature) => (
                  <div className="relative pl-9" key={feature.title}>
                    <dt className="inline font-semibold text-gray-900">
                      <feature.icon
                        aria-hidden="true"
                        className="absolute left-1 top-1 h-5 w-5 text-slate-600"
                      />
                      {t(feature.title)}
                    </dt>{" "}
                    <dd className="inline">{t(feature.description)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <img
            alt="Product screenshot"
            className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
            height={1442}
            // TODO(adelrodriguez): Replace this image with a real one
            src="https://tailwindui.com/img/component-images/dark-project-app-screenshot.png"
            width={2432}
          />
        </div>
      </div>
    </div>
  )
}
