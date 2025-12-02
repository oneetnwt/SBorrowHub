import React from "react";

function CardSkeleton() {
  return (
    <div className="w-full rounded-md shadow-sm p-3 bg-white border border-black/10 animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full h-40 object-cover rounded-md bg-gray-200" />

      {/* Title Skeleton */}
      <div className="font-medium text-md my-3 h-6 bg-gray-200 rounded w-3/4" />

      {/* Available Count Skeleton */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-5 bg-gray-200 rounded w-1/3" />
      </div>

      {/* Tags Skeleton */}
      <div className="my-3 pt-3 flex items-center gap-3 border-t border-black/10">
        <div className="h-6 bg-gray-200 rounded-full w-20" />
        <div className="h-6 bg-gray-200 rounded-full w-24" />
      </div>

      {/* Buttons Skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <div className="h-10 bg-gray-200 rounded-sm mt-3" />
        <div className="h-10 bg-gray-200 rounded-sm mt-3" />
      </div>
    </div>
  );
}

export default CardSkeleton;
