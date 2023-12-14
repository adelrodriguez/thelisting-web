import { Listing } from "@prisma/client"
import { useSubmit } from "@remix-run/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import currency from "currency.js"
import { type ReactNode, createContext, useContext } from "react"
import { route } from "routes-gen"
import SuperJSON from "superjson"

import type { CartItem } from "~/utils/cart"

type CartItems = Map<string, CartItem>

type BaseCart = {
  listingId: string
  items: CartItems
  noteId?: string | null
}

type Cart = BaseCart & {
  add: (item: CartItem) => void
  attachNoteId: (note: string | null) => void
  checkout: () => void
  remove: (item: string) => void
}

const Context = createContext<Cart | undefined>(undefined)

function createDefaultCart(listingId: string): BaseCart {
  return {
    items: new Map<string, CartItem>(),
    listingId,
    noteId: undefined,
  }
}

Context.displayName = "Cart"

export function CartProvider({
  children,
  listing,
}: {
  children: ReactNode
  listing: Pick<Listing, "id" | "sku">
}) {
  // We use a Map to store the carts for each listing
  const { data } = useQuery({
    initialData: createDefaultCart(listing.id),
    queryFn: async () => {
      const res = await fetch(
        "/api/cart?" + new URLSearchParams({ listingId: listing.id }),
      )
      const data = (await res.json()) as { cart: string }
      const cart = SuperJSON.parse<BaseCart>(data.cart)

      return cart
    },
    queryKey: ["carts", listing.id],
    refetchOnWindowFocus: true,
  })
  const submit = useSubmit()

  const currentCart = data || createDefaultCart(listing.id)

  const queryClient = useQueryClient()
  const storeCarts = useMutation({
    mutationFn: (cart: BaseCart) =>
      fetch("/api/cart?" + new URLSearchParams({ listingId: listing.id }), {
        body: SuperJSON.stringify(cart),
        method: "POST",
      }),
    onMutate: (cart) => {
      queryClient.setQueryData(["carts", listing.id], cart)

      return cart
    },
    onSuccess: async (_, cart) => {
      queryClient.setQueryData(["carts", listing.id], cart)
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

  function checkout() {
    const formData = new FormData()
    const cartItems = JSON.stringify([...currentCart.items.values()])

    formData.append("cartItems", cartItems)
    formData.append("listingId", listing.id)
    formData.append("sku", `${listing.sku}`)

    if (currentCart.noteId) {
      formData.append("noteId", currentCart.noteId)
    }

    submit(formData, {
      action: route("/:listing/cart/checkout", {
        listing: `${listing.sku}`,
      }),
      method: "post",
      replace: true,
    })
  }

  return (
    <Context.Provider
      value={{
        add: addItemToCart,
        attachNoteId: attachNoteIdToCart,
        checkout,
        items: currentCart.items,
        listingId: listing.id,
        noteId: currentCart.noteId,
        remove: removeItemFromCart,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export function useCart(): Cart {
  const context = useContext(Context)

  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }

  return context
}
