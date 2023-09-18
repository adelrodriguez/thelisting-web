import { Link } from "@remix-run/react"

export default function CallToAction() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:pb-32">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          <span className="block">Ready to dive in?</span>
          <span className="block">Start your free trial today.</span>
        </h2>
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-md shadow">
            <Link
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-gray-600 px-5 py-3 text-base font-medium text-white hover:bg-gray-700"
              to="#"
            >
              Get started
            </Link>
          </div>
          <div className="ml-3 inline-flex">
            <Link
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-gray-100 px-5 py-3 text-base font-medium text-gray-700 hover:bg-gray-200"
              to="#"
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
