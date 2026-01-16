import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export const BannerSkeleton = () => {
  return (
    <section className="relative w-full aspect-[2/1] sm:aspect-auto sm:min-h-[60vh] flex items-center bg-black">
      <div className="absolute inset-0 w-full h-full">
        {/* Banner Image Skeleton */}
        <Skeleton className="absolute inset-0 w-full h-full rounded-none bg-gray-800/40 animate-pulse" />
        
        {/* Content Skeleton - mimics text and button layout */}
        <div className="absolute inset-0 flex items-end pb-2 sm:items-center sm:pb-0 sm:left-[10%]">
          <div className="flex flex-col gap-2 sm:gap-4 w-full px-4 sm:px-0 sm:max-w-md z-10">
            {/* Title Skeleton */}
            <Skeleton className="h-6 w-48 rounded bg-gray-700/50" />
            
            {/* Description Skeleton - hidden on mobile, visible on desktop */}
            <div className="hidden sm:flex flex-col gap-2">
              <Skeleton className="h-4 w-full rounded bg-gray-700/30" />
              <Skeleton className="h-4 w-5/6 rounded bg-gray-700/30" />
            </div>
            
            {/* Button Skeleton */}
            <Skeleton className="h-10 w-32 rounded bg-gray-700/50" />
          </div>
        </div>
      </div>
    </section>
  )
}
