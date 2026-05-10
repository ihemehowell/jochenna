import FeaturedProducts from "@/components/products/FeaturedProduct";


export default function HomePage() {
  return (
    <main>
      
      {/* Hero */}
      <section className="h-[90vh] flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          
          <p className="uppercase tracking-[0.3em] text-sm text-gray-500 mb-4">
            Premium Thrift Fashion
          </p>

          <h1 className="text-5xl md:text-7xl font-semibold leading-tight max-w-4xl text-gray-800">
            Curated thrift pieces for modern style.
          </h1>

          <button className="mt-8 bg-gray-900 text-white px-8 py-4 text-sm hover:bg-gray-800 transition duration-300 rounded">
            Shop Collection
          </button>
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts />
    </main>
  );
}