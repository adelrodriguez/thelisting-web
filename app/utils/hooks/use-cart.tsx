import currency from "currency.js"
import type { ReactNode } from "react"
import { useEffect } from "react"
import { createContext, useState, useContext } from "react"

import Storage from "~/helpers/storage"
import type { CartItem } from "~/utils/cart"
import { calculateShipping } from "~/utils/cart"
import { calculateSubtotal } from "~/utils/cart"

type CartItems = Map<string, CartItem>

type BaseCart = {
  listingId: string
  items: CartItems
  subtotal: number
  shipping: number
  total: number
  itemCount: number
  noteId?: string | null
}

type Cart = BaseCart & {
  add: (item: CartItem) => void
  remove: (item: string) => void
  attachNoteId: (note: string | null) => void
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
    itemCount: 0,
    items: new Map<string, CartItem>(),
    listingId: listing,
    noteId: undefined,
    shipping: 0,
    subtotal: 0,
    total: 0,
  }
  const subtotal = calculateSubtotal([...currentCart.items.values()])
  const itemCount = [...currentCart.items.values()].reduce(
    (acc, item) => acc + item.quantity,
    0
  )
  const shipping = calculateShipping(subtotal)
  const total = subtotal + shipping

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

  function addItemToCart({
    commerceId,
    id,
    price,
    quantity,
    variantId,
  }: CartItem) {
    const newItems = new Map(currentCart.items)

    newItems.set(id, {
      commerceId,
      id,
      price: currency(price).value,
      quantity,
      variantId,
    })

    saveCart("items", newItems)
  }

  function removeItemFromCart(id: string) {
    const newItems = new Map(currentCart.items)

    newItems.delete(id)

    saveCart("items", newItems)
  }

  function attachNoteIdToCart(noteId: string | null) {
    saveCart("noteId", noteId)
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
        attachNoteId: attachNoteIdToCart,
        itemCount,
        items: currentCart.items,
        listingId: listing,
        noteId: currentCart.noteId,
        remove: removeItemFromCart,
        shipping,
        subtotal,
        total,
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
