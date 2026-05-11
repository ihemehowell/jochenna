"use client";

import Skeleton from "@/components/ui/Skeleton";

export default function ProductCardSkeleton() {
  return (
    <div className="group">
      {/* Image Skeleton */}
      <Skeleton className="w-full h-80 bg-gray-200" />

      {/* Info Skeleton */}
      <div className="mt-4 space-y-3">
        <Skeleton className="h-4 w-24 bg-gray-200" />
        <Skeleton className="h-5 w-full bg-gray-200" />
        <Skeleton className="h-5 w-32 bg-gray-200" />
      </div>
    </div>
  );
}
