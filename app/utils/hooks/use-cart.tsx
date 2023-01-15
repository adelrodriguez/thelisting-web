import type { Item } from "@prisma/client"
import type { ReactNode, ReactElement } from "react"
import { createContext, useState, useContext } from "react"

type CartItem = Pick<Item, "id" | "title" | "commerceId"> & {
  quantity: number
  price: number
}

type CartItems = Map<string, CartItem>

type Cart = {
  items: CartItems
  add: (item: CartItem, quantity: number) => void
  remove: (item: string) => void
  subtotal: number
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
  const subtotal = Array.from(currentCart.items.values()).reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  function addItemToCart(item: CartItem, quantity: number) {
    const newItems = new Map(currentCart.items)

    newItems.set(item.id, {
      ...item,
      quantity,
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
