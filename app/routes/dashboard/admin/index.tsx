import {
  AcademicCapIcon,
  BanknotesIcon,
  ReceiptRefundIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline"
import { Link } from "@remix-run/react"
import classNames from "classnames"

const tools = [
  {
    description:
      "Import a CSV file with URLs to scrape product from, and export the results to a CSV file or to your Shopify store.",
    href: "/dashboard/admin/product-scraper",
    icon: MagnifyingGlassIcon,
    iconBackground: "bg-teal-50",
    iconForeground: "text-teal-700",
    title: "Scrape Products",
  },
  {
    description: "Coming soon",
    href: "#coming-soon5",
    icon: PhoneIcon,
    iconBackground: "bg-purple-50",
    iconForeground: "text-purple-700",
    title: "WhatsApp Broadcast",
  },
  {
    href: "#coming-soon4",
    icon: UsersIcon,
    iconBackground: "bg-sky-50",
    iconForeground: "text-sky-700",
    id: "coming-soon4",
    title: "Download Images",
  },
  {
    href: "#coming-soon3",
    icon: BanknotesIcon,
    iconBackground: "bg-yellow-50",
    iconForeground: "text-yellow-700",
    title: "Coming Soon",
  },
  {
    href: "#coming-soon2",
    icon: ReceiptRefundIcon,
    iconBackground: "bg-rose-50",
    iconForeground: "text-rose-700",
    title: "Coming Soon",
  },
  {
    href: "#coming-soon1",
    icon: AcademicCapIcon,
    iconBackground: "bg-indigo-50",
    iconForeground: "text-indigo-700",
    title: "Coming Soon",
  },
]

export default function AdminToolsPage() {
  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0">
      {tools.map((tool, toolIdx) => (
        <div
          key={tool.href}
          className={classNames(
            toolIdx === 0
              ? "rounded-tl-lg rounded-tr-lg sm:rounded-tr-none"
              : "",
            toolIdx === 1 ? "sm:rounded-tr-lg" : "",
            toolIdx === tools.length - 2 ? "sm:rounded-bl-lg" : "",
            toolIdx === tools.length - 1
              ? "rounded-bl-lg rounded-br-lg sm:rounded-bl-none"
              : "",
            "group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500"
          )}
        >
          <div>
            <span
              className={classNames(
                tool.iconBackground,
                tool.iconForeground,
                "inline-flex rounded-lg p-3 ring-4 ring-white"
              )}
            >
              <tool.icon className="h-6 w-6" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium">
              <Link to={tool.href} className="focus:outline-none">
                {/* Extend touch target to entire panel */}
                <span className="absolute inset-0" aria-hidden="true" />
                {tool.title}
              </Link>
            </h3>
            <p className="mt-2 text-sm text-gray-500">{tool.description}</p>
          </div>
          <span
            className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
            aria-hidden="true"
          >
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
            </svg>
          </span>
        </div>
      ))}
    </div>
  )
}
