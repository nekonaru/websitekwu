export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="skeleton mb-4 h-8 w-56 rounded" />
      <div className="skeleton mb-8 h-12 w-full max-w-xl rounded-xl" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-border bg-white"
            aria-hidden="true"
          >
            <div className="skeleton aspect-[4/5] w-full" />
            <div className="space-y-2 p-4">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-5 w-1/2 rounded" />
              <div className="skeleton h-9 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
      <p className="sr-only" role="status">
        Memuat halaman...
      </p>
    </div>
  );
}
