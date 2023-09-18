import { CheckIcon } from "@heroicons/react/20/solid"

const tiers = [
  {
    description: "All the basics for starting a new business",
    href: "#",
    includedFeatures: [
      "Potenti felis, in cras at at ligula nunc.",
      "Orci neque eget pellentesque.",
    ],
    name: "Hobby",
    priceMonthly: 12,
  },
  {
    description: "All the basics for starting a new business",
    href: "#",
    includedFeatures: [
      "Potenti felis, in cras at at ligula nunc. ",
      "Orci neque eget pellentesque.",
      "Donec mauris sit in eu tincidunt etiam.",
    ],
    name: "Freelancer",
    priceMonthly: 24,
  },
  {
    description: "All the basics for starting a new business",
    href: "#",
    includedFeatures: [
      "Potenti felis, in cras at at ligula nunc. ",
      "Orci neque eget pellentesque.",
      "Donec mauris sit in eu tincidunt etiam.",
      "Faucibus volutpat magna.",
    ],
    name: "Startup",
    priceMonthly: 32,
  },
  {
    description: "All the basics for starting a new business",
    href: "#",
    includedFeatures: [
      "Potenti felis, in cras at at ligula nunc. ",
      "Orci neque eget pellentesque.",
      "Donec mauris sit in eu tincidunt etiam.",
      "Faucibus volutpat magna.",
      "Id sed tellus in varius quisque.",
      "Risus egestas faucibus.",
      "Risus cursus ullamcorper.",
    ],
    name: "Enterprise",
    priceMonthly: 48,
  },
]

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl py-32 px-4 sm:px-6 lg:px-8">
      <div className="sm:align-center sm:flex sm:flex-col">
        <h1 className="font-heading text-5xl font-bold tracking-tight text-gray-900 sm:text-center">
          Pricing Plans
        </h1>
        <p className="mt-5 text-xl text-gray-500 sm:text-center">
          Start building for free, then add a site plan to go live. Account
          plans unlock additional features.
        </p>
      </div>
      <div className="mt-12 space-y-4 sm:mt-16 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 lg:mx-auto lg:max-w-4xl xl:mx-0 xl:max-w-none xl:grid-cols-4">
        {tiers.map((tier) => (
          <div
            className="divide-y divide-gray-200 rounded-lg border border-gray-200 shadow-sm"
            key={tier.name}
          >
            <div className="p-6">
              <h2 className="text-lg font-medium leading-6 text-gray-900">
                {tier.name}
              </h2>
              <p className="mt-4 text-sm text-gray-500">{tier.description}</p>
              <p className="mt-8">
                <span className="text-4xl font-bold tracking-tight text-gray-900">
                  ${tier.priceMonthly}
                </span>{" "}
                <span className="text-base font-medium text-gray-500">/mo</span>
              </p>
              <a
                className="mt-8 block w-full rounded-md border border-gray-800 bg-gray-800 py-2 text-center text-sm font-semibold text-white hover:bg-gray-900"
                href={tier.href}
              >
                Buy {tier.name}
              </a>
            </div>
            <div className="px-6 pt-6 pb-8">
              <h3 className="text-sm font-medium text-gray-900">
                What's included
              </h3>
              <ul className="mt-6 space-y-4">
                {tier.includedFeatures.map((feature) => (
                  <li className="flex space-x-3" key={feature}>
                    <CheckIcon
                      aria-hidden="true"
                      className="h-5 w-5 flex-shrink-0 text-green-500"
                    />
                    <span className="text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
