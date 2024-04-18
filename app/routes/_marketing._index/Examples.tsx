import clsx from "clsx"

const rotations = ["rotate-2", "-rotate-2", "rotate-2", "rotate-2", "-rotate-2"]

export default function Examples() {
  return (
    <section id="examples">
      <div className="mt-16 sm:mt-20">
        <div className="-my-4 flex justify-center gap-5 overflow-hidden py-12 sm:gap-8">
          {[
            "https://spotlight.tailwindui.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimage-2.3c6c01cf.jpg&w=640&q=75",
            "https://spotlight.tailwindui.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimage-2.3c6c01cf.jpg&w=640&q=75",
            "https://spotlight.tailwindui.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimage-2.3c6c01cf.jpg&w=640&q=75",
            "https://spotlight.tailwindui.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimage-2.3c6c01cf.jpg&w=640&q=75",
            "https://spotlight.tailwindui.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimage-2.3c6c01cf.jpg&w=640&q=75",
          ].map((image, imageIndex) => (
            <div
              className={clsx(
                "relative aspect-[9/10] w-44 flex-none overflow-hidden rounded-xl bg-zinc-100 py-6 shadow-lg transition-transform duration-300 hover:scale-105 sm:w-72 sm:rounded-2xl dark:bg-zinc-800",
                rotations[imageIndex % rotations.length],
              )}
              key={image}
            >
              <img
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                sizes="(min-width: 640px) 18rem, 11rem"
                src={image}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
