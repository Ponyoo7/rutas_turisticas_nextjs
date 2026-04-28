export const CityExplorerSkeleton = () => {
  return (
    <div className="grid grid-cols-1">
      <div className="flex flex-col gap-6 px-4 pb-4 lg:col-span-8">
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            <div className="h-8 w-64 animate-pulse rounded-full bg-gray-200" />
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="h-[600px] animate-pulse rounded-xl bg-gray-100" />
        </div>

        <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="h-8 w-56 animate-pulse rounded-full bg-gray-200" />
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-[24px] bg-gray-100"
              />
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="h-8 w-52 animate-pulse rounded-full bg-gray-200" />
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-[24px] bg-gray-100"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
