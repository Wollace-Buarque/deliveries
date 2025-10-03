export function DeliveryCardSkeleton() {
  return (
    <article className="rounded-lg bg-zinc-50 p-4 shadow-sm">
      <div className="flex justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="block h-6 w-22 animate-pulse rounded-full bg-zinc-200"></div>

            <div className="block h-7 w-72 animate-pulse rounded-md bg-zinc-200"></div>
          </div>

          <div className="mt-3">
            <div>
              <strong className="block h-5 w-96 animate-pulse rounded-md bg-zinc-200"></strong>
            </div>

            <div className="mt-2">
              <strong className="block h-5 w-80 animate-pulse rounded-md bg-zinc-200"></strong>
            </div>

            <div className="mt-1">
              <strong className="block h-5 w-80 animate-pulse rounded-md bg-zinc-200"></strong>
            </div>
          </div>
        </div>

        <div className="ml-auto min-w-36">
          <div className="ml-auto h-7 w-20 animate-pulse rounded-md bg-zinc-200"></div>
          <div className="mt-2 ml-auto h-5 w-28 animate-pulse rounded-md bg-zinc-200"></div>
          <div className="mt-1 ml-auto h-5 w-28 animate-pulse rounded-md bg-zinc-200"></div>
        </div>
      </div>
    </article>
  )
}
