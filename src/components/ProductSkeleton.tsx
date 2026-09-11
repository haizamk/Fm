import React from 'react';

export const ProductSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-4/3 bg-stone-200">
        {/* Shimmer top badges placeholder */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          <div className="h-5 w-20 bg-stone-300 rounded-full" />
          <div className="h-4 w-16 bg-stone-300/80 rounded-full" />
        </div>
        {/* Heart placeholder */}
        <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-stone-300" />
        {/* Weight badge placeholder */}
        <div className="absolute bottom-2.5 right-2.5 h-5 w-16 bg-stone-300/90 rounded-md" />
      </div>

      {/* Content Area Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating and freshness pill placeholder */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="h-4 w-16 bg-stone-200 rounded-md" />
            <div className="h-4 w-24 bg-stone-200 rounded-full" />
          </div>

          {/* Product Name placeholder */}
          <div className="h-5 w-4/5 bg-stone-300 rounded-md mb-2" />

          {/* Subtitle lines placeholder */}
          <div className="space-y-1.5 mb-3">
            <div className="h-3 w-full bg-stone-200 rounded-sm" />
            <div className="h-3 w-3/4 bg-stone-200 rounded-sm" />
          </div>

          {/* Cut Feature tag placeholder */}
          <div className="h-6 w-3/4 bg-stone-100 rounded-lg border border-stone-200/60" />
        </div>

        {/* Pricing & CTA placeholder */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="h-6 w-24 bg-stone-300 rounded-md" />
            <div className="h-4 w-20 bg-stone-200 rounded-sm" />
          </div>
          <div className="h-9 w-24 bg-stone-300 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductSkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  );
};
