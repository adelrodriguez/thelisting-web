export default function RegistryItemSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden xl:aspect-h-8 xl:aspect-w-7 sm:rounded-lg">
        <div className="h-full w-full bg-gray-200" />
      </div>
      <div className="mt-4 space-y-4">
        <div className="h-4 rounded bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 w-1/4 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  )
}
