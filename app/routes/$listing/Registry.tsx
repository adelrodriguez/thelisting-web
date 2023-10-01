import { ShoppingBagIcon } from "@heroicons/react/24/outline"
import type { Item } from "@prisma/client"
import { Link } from "@remix-run/react"
import { useAnimate } from "framer-motion"
import { useCallback, useEffect } from "react"

import { useCart } from "~/utils/hooks"
import { sortByQuantity } from "~/utils/item"

import RegistryItem from "./RegistryItem"

export default function Registry({
  items,
}: {
  items: Pick<Item, "id" | "sku" | "commerceId" | "stock" | "quantity">[]
}) {
  const cart = useCart()
  const [scope, animate] = useAnimate()
  const shake = useCallback(() => {
    void animate(
      scope.current,
      {
        rotate: [0, -12, 12, -12, 12, 0],
      },
      { duration: 1.5, ease: "easeInOut" },
    )
  }, [animate, scope])

  useEffect(() => {
    if (cart.itemCount === 0) return

    shake()
  }, [cart.itemCount, shake])

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-8 xl:grid-cols-4 xl:gap-x-10">
      {items.sort(sortByQuantity).map((item) => {
        if (!item.commerceId) return null

        const isAvailable = item.stock > 0

        return (
          <RegistryItem
            available={isAvailable}
            commerceId={item.commerceId}
            key={item.id}
            sku={item.sku}
          />
        )
      })}
      <div className="group fixed bottom-8 right-8 z-10" ref={scope}>
        <Link prefetch="intent" preventScrollReset relative="path" to="cart">
          {!!cart.itemCount && (
            <div className="absolute right-0 top-0 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs text-white md:h-7 md:w-7 md:text-sm">
              {cart.itemCount}
            </div>
          )}

          <button
            className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-600 text-4xl text-white drop-shadow-xl duration-300 group-hover:shadow-2xl md:h-20 md:w-20"
            title="Go to cart"
          >
            <ShoppingBagIcon className="h-8 w-8 duration-300 group-hover:h-9 group-hover:w-9 md:h-10 md:w-10 md:group-hover:h-12 md:group-hover:w-12" />
          </button>
        </Link>
      </div>
    </div>
  )
}
