export default function Logo({
  height = 48,
  width = 48,
  className,
}: {
  height?: number
  width?: number
  className?: string
}) {
  return (
    <img
      height={height}
      width={width}
      className={className}
      src="https://tailwindui.com/img/logos/mark.svg"
      alt="The Listing"
      placeholder="empty"
    />
  )
}
