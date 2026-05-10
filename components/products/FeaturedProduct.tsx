import { products } from "@/data/products";
import ProductCard from "./ProductCard";

export default function FeaturedProducts() {
  return (
    <section className="py-20 px-4 md:px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Heading */}
        <div className="mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-3">
            Featured Collection
          </p>

          <h2 className="text-4xl font-semibold">
            Latest Drops
          </h2>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
}