import currency from "currency.js"
import type { ReactNode, ReactElement } from "react"
import { useEffect } from "react"
import { createContext, useState, useContext } from "react"

import Storage from "~/helpers/storage"
import type { CartItem } from "~/utils/cart"
import { calculateSubtotal } from "~/utils/cart"

type CartItems = Map<string, CartItem>

type Cart = {
  items: CartItems
  add: (item: CartItem, quantity: number) => void
  remove: (item: string) => void
  subtotal: number
  listingId: string
}

const Context = createContext<Cart | undefined>(undefined)

Context.displayName = "Cart"

export function CartProvider({
  children,
  listing,
}: {
  children: ReactNode
  listing: string
}): ReactElement {
  // We use a Map to store the carts for each listing
  const [carts, setCarts] = useState<Map<string, { items: CartItems }>>(
    new Map()
  )
  const currentCart = carts.get(listing) ?? {
    items: new Map<string, CartItem>(),
  }
  const subtotal = calculateSubtotal([...currentCart.items.values()])

  useEffect(() => {
    if (carts.size > 0) return

    const storage = new Storage("local")
    const storedCarts = storage.get("carts")

    if (!storedCarts) return

    setCarts((storedCarts as Map<string, { items: CartItems }>) ?? new Map())
  }, [carts.size])

  useEffect(() => {
    if (carts.size === 0) return

    const storage = new Storage("local")

    storage.set("carts", carts)
  }, [carts])

  function addItemToCart(item: CartItem, quantity: number) {
    const newItems = new Map(currentCart.items)

    newItems.set(item.id, {
      commerceId: item.commerceId,
      id: item.id,
      price: currency(item.price).value,
      quantity,
      title: item.title,
      variantId: item.variantId,
    })

    saveCart(newItems)
  }

  function removeItemFromCart(id: string) {
    const newItems = new Map(currentCart.items)

    newItems.delete(id)

    saveCart(newItems)
  }

  function saveCart(items: CartItems) {
    const newCart = {
      ...currentCart,
      items,
    }

    setCarts((prev) => new Map(prev).set(listing, newCart))
  }

  return (
    <Context.Provider
      value={{
        add: addItemToCart,
        items: currentCart.items,
        listingId: listing,
        remove: removeItemFromCart,
        subtotal,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export default function useCart(): Cart {
  const context = useContext(Context)

  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }

  return context
}
