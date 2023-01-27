import { ShoppingCartIcon } from "@heroicons/react/24/solid"
import type { Item } from "@prisma/client"
import { Link } from "@remix-run/react"

import { RegistryItem } from "~/components/registry"

export default function Registry({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-2 gap-y-10 gap-x-4 md:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
      {items.map((item) => {
        if (!item.commerceId) return null

        return (
          <RegistryItem
            commerceId={item.commerceId}
            id={item.id}
            key={item.id}
          />
        )
      })}
      <Link to="cart" relative="path" prefetch="intent" preventScrollReset>
        <button
          title="Go to cart"
          className="fixed z-2 bottom-8 right-8 bg-gray-600 w-16 h-16 rounded-full drop-shadow-lg flex justify-center items-center text-white text-4xl hover:bg-blue-700 hover:drop-shadow-2xl hover:animate-bounce duration-300"
        >
          <ShoppingCartIcon className="h-8 w-8" />
        </button>
      </Link>
    </div>
  )
}
