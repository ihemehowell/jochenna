export default function Loading() {
  return (
    <main className="px-4 md:px-8 py-10">
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="h-6 w-28 rounded bg-hairline mb-3" />
        <div className="h-12 w-64 rounded bg-hairline mb-12" />
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-12">
          <aside className="space-y-6">
            <div className="h-10 rounded bg-hairline" />
            <div className="h-36 rounded bg-hairline" />
          </aside>
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            <div className="h-96 rounded bg-hairline" />
            <div className="h-96 rounded bg-hairline" />
            <div className="h-96 rounded bg-hairline" />
          </section>
        </div>
      </div>
    </main>
  );
}