export default function Loading() {
  return (
    <main className="px-4 md:px-8 py-16">
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-6 w-32 rounded bg-gray-200" />
        <div className="h-12 w-2/3 rounded bg-gray-200" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-80 rounded bg-gray-200" />
          <div className="h-80 rounded bg-gray-200" />
          <div className="h-80 rounded bg-gray-200" />
        </div>
      </div>
    </main>
  );
}