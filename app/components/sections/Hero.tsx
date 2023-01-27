export default function Hero({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <div className="relative bg-gray-800">
        <div className="absolute inset-0">
          <img
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1769&q=80"
            alt=""
          />
          <div
            className="absolute inset-0 bg-gray-500 mix-blend-multiply"
            aria-hidden="true"
          />
        </div>
        <div className="relative mx-auto max-w-7xl py-24 px-6 sm:py-32 md:py-48 lg:py-64 lg:px-8">
          <h1 className="text-4xl font-headline font-bold text-white sm:text-5xl lg:text-6xl md:text-center">
            {children}
          </h1>
        </div>
      </div>
    </section>
  )
}
