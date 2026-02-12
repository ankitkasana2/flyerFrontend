"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { FlyerRibbon } from "../orer-form/flyer-ribbon"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { ImageIcon } from "lucide-react"

interface FlyerFrameProps {
    flyer: any
    className?: string
    aspectRatio?: string // e.g. "aspect-[3/4]"
    showRibbon?: boolean
}

export function FlyerFrame({
    flyer,
    className,
    aspectRatio = "aspect-[2/3]",
    showRibbon = true
}: FlyerFrameProps) {
    const imageUrl = flyer?.image_url || flyer?.imageUrl || "/placeholder.svg"

    return (
        <div
            className={cn(
                "relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/50 shadow-2xl transition-all duration-500 hover:border-red-500/50 group",
                aspectRatio,
                className
            )}
        >


            <Image
                src={imageUrl}
                alt={flyer?.name || "Flyer"}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-all duration-700 group-hover:scale-110"
            />

            {/* Glass Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />

            {/* Moving Gloss Reflection */}
            <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
            </div>

            {showRibbon && (
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-30">
                    <FlyerRibbon flyer={flyer} />
                </div>
            )}
        </div>
    )
}
