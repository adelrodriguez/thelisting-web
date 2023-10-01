import {
  AcademicCapIcon,
  PhoneIcon,
  PhotoIcon,
  GiftIcon,
} from "@heroicons/react/24/outline"
import { QueueListIcon, UserGroupIcon } from "@heroicons/react/24/solid"
import { Link } from "@remix-run/react"
import clsx from "clsx"

// TODO(adelrodriguez): Replace hrefs with route()
const tools = [
  {
    description:
      "Import a CSV file with URLs to scrape product from, and export the results to a CSV file or to your Shopify store (coming soon).",
    href: "./product-scraper",
    icon: GiftIcon,
    iconBackground: "bg-teal-50",
    iconForeground: "text-teal-700",
    title: "Scrape Products",
  },
  {
    description:
      "Import a CSV file with filenames and URLs to scrape images from, and the results will be downloaded to your computer.",
    href: "./image-scraper",
    icon: PhotoIcon,
    iconBackground: "bg-sky-50",
    iconForeground: "text-sky-700",
    title: "Scrape Images",
  },
  {
    description:
      "Send a pre-defined template message to multiple phone numbers.",
    href: "./whatsapp-broadcast",
    icon: PhoneIcon,
    iconBackground: "bg-purple-50",
    iconForeground: "text-purple-700",
    title: "WhatsApp Broadcast",
  },

  {
    description: "Create, edit, and delete users.",
    href: "./users",
    icon: UserGroupIcon,
    iconBackground: "bg-yellow-50",
    iconForeground: "text-yellow-700",
    title: "User Management",
  },
  {
    description: "Open the jobs dashboard.",
    href: "./jobs",
    icon: QueueListIcon,
    iconBackground: "bg-rose-50",
    iconForeground: "text-rose-700",
    title: "Jobs Dashboard",
  },
  {
    description: "Manually queue a job.",
    href: "./manual-jobs",
    icon: AcademicCapIcon,
    iconBackground: "bg-gray-50",
    iconForeground: "text-gray-700",
    title: "Webhooks",
  },
]

export default function AdminToolsPage() {
  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0">
      {tools.map((tool, toolIdx) => (
        <div
          className={clsx(
            toolIdx === 0
              ? "rounded-tl-lg rounded-tr-lg sm:rounded-tr-none"
              : "",
            toolIdx === 1 ? "sm:rounded-tr-lg" : "",
            toolIdx === tools.length - 2 ? "sm:rounded-bl-lg" : "",
            toolIdx === tools.length - 1
              ? "rounded-bl-lg rounded-br-lg sm:rounded-bl-none"
              : "",
            "group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-gray-500",
          )}
          key={tool.href}
        >
          <div>
            <span
              className={clsx(
                tool.iconBackground,
                tool.iconForeground,
                "inline-flex rounded-lg p-3 ring-4 ring-white",
              )}
            >
              <tool.icon aria-hidden="true" className="h-6 w-6" />
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium">
              <Link className="focus:outline-none" to={tool.href}>
                {/* Extend touch target to entire panel */}
                <span aria-hidden="true" className="absolute inset-0" />
                {tool.title}
              </Link>
            </h3>
            <p className="mt-2 text-sm text-gray-500">{tool.description}</p>
          </div>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400"
          >
            <svg
              className="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
            </svg>
          </span>
        </div>
      ))}
    </div>
  )
}
