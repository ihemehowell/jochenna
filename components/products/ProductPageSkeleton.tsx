"use client";

import Skeleton from "@/components/ui/Skeleton";

export default function ProductPageSkeleton() {
  return (
    <div className="px-4 md:px-8 py-10 bg-paper">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Skeleton */}
          <Skeleton className="w-full h-175 bg-hairline" />

          {/* Info Skeleton */}
          <div className="flex flex-col justify-center space-y-6">
            <Skeleton className="h-4 w-32 bg-hairline" />
            <Skeleton className="h-10 w-full bg-hairline" />
            <Skeleton className="h-8 w-48 bg-hairline" />
            <Skeleton className="h-20 w-full bg-hairline" />
            <Skeleton className="h-6 w-32 bg-hairline" />
            <Skeleton className="h-12 w-full bg-hairline" />
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-28">
          <div className="mb-12">
            <Skeleton className="h-4 w-40 mb-3 bg-hairline" />
            <Skeleton className="h-8 w-48 bg-hairline" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="w-full h-80 bg-hairline" />
                <Skeleton className="h-4 w-24 bg-hairline" />
                <Skeleton className="h-5 w-full bg-hairline" />
                <Skeleton className="h-5 w-32 bg-hairline" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
