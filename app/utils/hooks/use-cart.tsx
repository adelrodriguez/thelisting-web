import currency from "currency.js"
import type { ReactNode } from "react"
import { useEffect } from "react"
import { createContext, useState, useContext } from "react"

import Storage from "~/helpers/storage"
import type { CartItem } from "~/utils/cart"
import { calculateSubtotal } from "~/utils/cart"

type CartItems = Map<string, CartItem>

type BaseCart = {
  items: CartItems
  note?: string
  subtotal: number
}

type Cart = BaseCart & {
  add: (item: CartItem, quantity: number) => void
  listingId: string
  remove: (item: string) => void
  setNote: (note: string) => void
}

const Context = createContext<Cart | undefined>(undefined)

Context.displayName = "Cart"

export function CartProvider({
  children,
  listing,
}: {
  children: ReactNode
  listing: string
}) {
  // We use a Map to store the carts for each listing
  const [carts, setCarts] = useState<Map<string, BaseCart>>(new Map())
  const currentCart = carts.get(listing) || {
    items: new Map<string, CartItem>(),
    listingId: listing,
    note: undefined,
    subtotal: 0,
  }
  const subtotal = calculateSubtotal([...currentCart.items.values()])

  useEffect(() => {
    if (carts.size > 0) return

    const storage = new Storage("local")
    const storedCarts = storage.get<Map<string, BaseCart>>("carts")

    if (!storedCarts) return

    setCarts(storedCarts)
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

    saveCart("items", newItems)
  }

  function removeItemFromCart(id: string) {
    const newItems = new Map(currentCart.items)

    newItems.delete(id)

    saveCart("items", newItems)
  }

  function saveCart<T extends keyof BaseCart>(key: T, value: BaseCart[T]) {
    const newCart = {
      ...currentCart,
      [key]: value,
    }

    setCarts((prev) => new Map(prev).set(listing, newCart))
  }

  return (
    <Context.Provider
      value={{
        add: addItemToCart,
        items: currentCart.items,
        listingId: listing,
        note: currentCart.note,
        remove: removeItemFromCart,
        setNote: (note) => saveCart("note", note),
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
