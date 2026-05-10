import Image from "next/image";
import { notFound } from "next/navigation";

import { products } from "@/data/products";

import ProductCard from "@/components/products/ProductCard";
// import AddToCartButton from "@/components/products/AddToCartButton";
import ProductActions from "@/components/products/ProductAction";

const FALLBACK_IMAGE =
  'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="960" viewBox="0 0 800 960"%3E%3Crect width="800" height="960" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial, sans-serif" font-size="28"%3EImage unavailable%3C/text%3E%3C/svg%3E';



export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = products.find(
    (item) => item.id === Number(id)
  );

  if (!product) {
    notFound();
  }
  const relatedProducts = products.filter(
    (item) =>
      item.category === product.category &&
      item.id !== product.id
  );

  return (
    <main className="px-4 md:px-8 py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Image */}
          <div className="bg-gray-100">
            <Image
              src={product.images?.[0] || FALLBACK_IMAGE}
              alt={product.name}
              width={1000} 
              height={1000}
              className="w-full h-175 object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            
            <p className="uppercase tracking-[0.2em] text-sm text-gray-500 mb-4">
              {product.category}
            </p>

            <h1 className="text-4xl md:text-5xl font-semibold mb-6 leading-tight text-gray-900">
              {product.name}
            </h1>

            <p className="text-2xl font-semibold mb-8 text-gray-900">
              ₦{product.price.toLocaleString()}
            </p>

            <p className="text-gray-600 leading-relaxed mb-8">
              Carefully curated premium thrift fashion
              piece designed for modern streetwear and
              timeless styling.
            </p>

            {/* Stock */}
            <div className="mb-8">
              {product.stock > 0 ? (
                <p className="text-green-600">
                  In Stock ({product.stock} left)
                </p>
              ) : (
                <p className="text-red-500">
                  Out of Stock
                </p>
              )}
            </div>

            {/* Button */}
              <ProductActions product={product} />
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-28">
            
            <div className="mb-12">
              <p className="uppercase tracking-[0.3em] text-sm text-gray-500 mb-3">
                You May Also Like
              </p>

              <h2 className="text-4xl font-semibold">
                Related Pieces
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}