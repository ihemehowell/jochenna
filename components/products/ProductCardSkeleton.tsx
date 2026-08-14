"use client";

import Skeleton from "@/components/ui/Skeleton";

export default function ProductCardSkeleton() {
  return (
    <div className="group">
      {/* Image Skeleton */}
      <Skeleton className="w-full h-80 bg-hairline" />

      {/* Info Skeleton */}
      <div className="mt-4 space-y-3">
        <Skeleton className="h-4 w-24 bg-hairline" />
        <Skeleton className="h-5 w-full bg-hairline" />
        <Skeleton className="h-5 w-32 bg-hairline" />
      </div>
    </div>
  );
}
