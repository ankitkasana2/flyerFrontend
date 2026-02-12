import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const FlyersSkeleton = () => {
    return (
        <section className="py-2 px-5">
            <div className="flex flex-col gap-3">
                {/* Title Skeleton */}
                <Skeleton className="h-6 w-40 rounded bg-gray-800/50" />

                {/* Carousel Skeleton */}
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex-shrink-0 w-[calc((100%_-_16px)_/_2)] sm:w-[280px]">
                            <div className="flex flex-col gap-2">
                                {/* Image Aspect Ratio similar to flyer card */}
                                <Skeleton className="aspect-[3/4] w-full rounded-xl bg-gray-800/40" />

                                {/* Text lines */}
                                <Skeleton className="h-4 w-3/4 bg-gray-800/50" />
                                <Skeleton className="h-4 w-1/2 bg-gray-800/50" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
