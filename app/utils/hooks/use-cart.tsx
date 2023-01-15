import type { Item } from "@prisma/client"
import type { ReactNode, ReactElement } from "react"
import { createContext, useState, useContext } from "react"

type CartItem = Pick<Item, "id" | "title" | "commerceId"> & {
  quantity: number
  price: number
}

type CartItems = Map<string, CartItem>

type CartContext = {
  items: CartItems
  add: (item: CartItem, quantity: number) => void
  remove: (item: string) => void
  empty: () => void
  subtotal: number
}

const Context = createContext<CartContext | undefined>(undefined)

Context.displayName = "Cart"

export function CartProvider({
  children,
}: {
  children: ReactNode
}): ReactElement {
  const [items, setItems] = useState<CartItems>(new Map())

  const subtotal = Array.from(items.values()).reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  function addItemToCart(item: CartItem, quantity: number) {
    const newItems = new Map(items)
    newItems.set(item.id, {
      ...item,
      quantity,
    })

    setItems(newItems)
  }

  function removeItemFromCart(id: string) {
    const newItems = new Map(items)

    newItems.delete(id)

    setItems(newItems)
  }

  function emptyCart() {
    setItems(new Map())
  }

  return (
    <Context.Provider
      value={{
        add: addItemToCart,
        empty: emptyCart,
        items,
        remove: removeItemFromCart,
        subtotal,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export default function useCart(): CartContext {
  const context = useContext(Context)

  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }

  return context
}
