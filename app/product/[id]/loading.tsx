export default function Loading() {
  return (
    <main className="px-4 md:px-8 py-10">
      <div className="max-w-7xl mx-auto animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="h-175 rounded bg-gray-200" />
        <div className="space-y-6">
          <div className="h-5 w-32 rounded bg-gray-200" />
          <div className="h-12 w-2/3 rounded bg-gray-200" />
          <div className="h-8 w-36 rounded bg-gray-200" />
          <div className="h-24 rounded bg-gray-200" />
          <div className="h-12 w-44 rounded bg-gray-200" />
        </div>
      </div>
    </main>
  );
}