import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import currency from "currency.js"
import type { ReactNode } from "react"
import { createContext, useContext } from "react"
import SuperJSON from "superjson"

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

function createDefaultCart(listing: string): BaseCart {
  return {
    itemCount: 0,
    items: new Map<string, CartItem>(),
    listingId: listing,
    noteId: undefined,
    shipping: 0,
    subtotal: 0,
    total: 0,
  }
}

Context.displayName = "Cart"

export function CartProvider({
  children,
  listing,
}: {
  children: ReactNode
  listing: string
}) {
  // We use a Map to store the carts for each listing
  const { data } = useQuery<BaseCart>(
    ["carts", listing],
    () =>
      fetch("/api/cart?" + new URLSearchParams({ listing }))
        .then((res) => res.json())
        .then((data) => SuperJSON.parse<BaseCart>(data.cart)),
    {
      initialData: createDefaultCart(listing),
    }
  )

  const currentCart = data || createDefaultCart(listing)

  const subtotal = calculateSubtotal([...currentCart.items.values()])
  const itemCount = [...currentCart.items.values()].reduce(
    (acc, item) => acc + item.quantity,
    0
  )
  const shipping = calculateShipping(subtotal)
  const total = subtotal + shipping
  const queryClient = useQueryClient()
  const storeCarts = useMutation({
    mutationFn: (cart: BaseCart) =>
      fetch("/api/cart?" + new URLSearchParams({ listing }), {
        body: SuperJSON.stringify(cart),
        method: "POST",
      }),
    onMutate: (cart) => {
      queryClient.setQueryData(["carts", listing], cart)

      return cart
    },
    onSuccess: async (_, cart) => {
      queryClient.setQueryData(["carts", listing], cart)
    },
  })

  function addItemToCart({
    commerceId,
    id,
    price,
    quantity,
    variantId,
    sku,
  }: CartItem) {
    const newItems = new Map(currentCart.items)

    newItems.set(id, {
      commerceId,
      id,
      price: currency(price).value,
      quantity,
      sku,
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

    storeCarts.mutate(newCart)
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
