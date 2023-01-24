import type { Item } from "@prisma/client"

import { RegistryItem } from "~/components/registry"

export default function Registry({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
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
    </div>
  )
}
