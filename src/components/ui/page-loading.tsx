
type LoadingVariant = "page" | "dashboard" | "list";

export default function PageLoading({
  variant = "page",
}: {
  variant?: LoadingVariant;
}) {
  const skeleton = "animate-pulse rounded-xl bg-[#e7eee8]";

  if (variant === "dashboard") {
    return (
      <main
        aria-busy="true"
        className="min-h-screen bg-[#f5f8f5] p-5 md:p-8"
      >
        <div className="mx-auto grid max-w-[1500px] gap-6 lg:grid-cols-[250px_1fr]">
          <aside className="hidden rounded-2xl border border-[#e7ece7] bg-white p-6 lg:block">
            <div className={`${skeleton} mb-10 h-12 w-36`} />
            <div className="space-y-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`${skeleton} h-11 w-full`} />
              ))}
            </div>
          </aside>

          <section className="space-y-7">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className={`${skeleton} h-8 w-56`} />
                <div className={`${skeleton} h-4 w-72 max-w-full`} />
              </div>
              <div className={`${skeleton} h-11 w-11 rounded-full`} />
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[#e7ece7] bg-white p-6"
                >
                  <div className={`${skeleton} mb-5 h-11 w-11`} />
                  <div className={`${skeleton} mb-3 h-4 w-28`} />
                  <div className={`${skeleton} h-9 w-20`} />
                </div>
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[#e7ece7] bg-white p-6"
                >
                  <div className={`${skeleton} mb-6 h-6 w-40`} />
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div
                        key={j}
                        className={`${skeleton} h-14 w-full`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (variant === "list") {
    return (
      <main
        aria-busy="true"
        className="min-h-[75vh] bg-[#f8faf8] px-5 py-12 md:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className={`${skeleton} mb-4 h-9 w-64 max-w-full`} />
          <div className={`${skeleton} mb-9 h-4 w-96 max-w-full`} />

          <div className="mb-8 grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`${skeleton} h-12 w-full`} />
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-[#e7ece7] bg-white p-5"
              >
                <div className={`${skeleton} mb-5 h-40 w-full`} />
                <div className={`${skeleton} mb-3 h-6 w-3/4`} />
                <div className={`${skeleton} mb-3 h-4 w-1/2`} />
                <div className={`${skeleton} mb-6 h-4 w-full`} />
                <div className={`${skeleton} h-11 w-full`} />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      aria-busy="true"
      className="flex min-h-[75vh] items-center justify-center bg-[#f8faf8] px-5 py-12"
    >
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf4ed]">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-[#c6dfce] border-t-[#075c3d]" />
        </div>
        <div className={`${skeleton} mx-auto mb-3 h-6 w-48`} />
        <div className={`${skeleton} mx-auto h-4 w-64 max-w-full`} />
      </div>
    </main>
  );
}
