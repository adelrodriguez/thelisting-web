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
  items: Omit<Item, "createdAt" | "updatedAt">[]
}) {
  const cart = useCart()
  const [scope, animate] = useAnimate()
  const shake = useCallback(() => {
    animate(
      scope.current,
      {
        rotate: [0, -12, 12, -12, 12, 0],
      },
      { duration: 1.5, ease: "easeInOut" }
    )
  }, [animate, scope])

  useEffect(() => {
    if (cart.itemCount === 0) return

    shake()
  }, [cart.itemCount, shake])

  return (
    <div className="grid grid-cols-2 gap-y-8 gap-x-4 md:grid-cols-3 md:gap-x-8 xl:grid-cols-4 xl:gap-x-10">
      {items.sort(sortByQuantity).map((item) => {
        if (!item.commerceId) return null

        const isAvailable = item.stock > 0

        return (
          <RegistryItem
            commerceId={item.commerceId}
            sku={item.sku}
            key={item.id}
            available={isAvailable}
          />
        )
      })}
      <div className="group fixed bottom-8 right-8 z-10" ref={scope}>
        <Link to="cart" relative="path" prefetch="intent" preventScrollReset>
          {!!cart.itemCount && (
            <div className="absolute top-0 right-0 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs text-white md:h-7 md:w-7 md:text-sm">
              {cart.itemCount}
            </div>
          )}

          <button
            title="Go to cart"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-600 text-4xl text-white drop-shadow-xl duration-300 group-hover:shadow-2xl md:h-20 md:w-20"
          >
            <ShoppingBagIcon className="h-8 w-8 duration-300 group-hover:h-9 group-hover:w-9 md:h-10 md:w-10 md:group-hover:h-12 md:group-hover:w-12" />
          </button>
        </Link>
      </div>
    </div>
  )
}
