import type { Item } from "@prisma/client"

export default function ListingItem({
  title,
  description,
}: {
  title: Item["title"]
  description: Item["description"]
}) {
  return (
    <div className="flex gap-2">
      <p>{title}</p>
      <p>{description}</p>
    </div>
  )
}
