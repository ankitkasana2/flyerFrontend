"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Check, Image as ImageIcon } from "lucide-react"
import type { Flyer } from "@/lib/types"
import Link from "next/link"
import { observer } from "mobx-react-lite";
import { useStore } from "@/stores/StoreProvider";
import { toast } from "sonner"
import { toJS } from "mobx"
import { FlyerRibbon } from "../orer-form/flyer-ribbon"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { FlyerFrame } from "./flyer-frame"

interface FlyerCardProps {
  flyer: Flyer
  selected?: boolean
  onPreview?: (flyer: Flyer) => void
  onAddToCart?: (flyer: Flyer) => void
  onToggleFavorite?: (flyer: Flyer) => void
}

const FlyerCardComponent = ({ flyer, selected, onPreview, onAddToCart, onToggleFavorite }: FlyerCardProps) => {

  const [isLoading, setIsLoading] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const { authStore, favoritesStore, loadingStore } = useStore()

  // Use authStore.user instead of useAuth() to work with AWS Cognito
  const user = authStore.user

  // Optimistic UI state
  const [optimisticFavorite, setOptimisticFavorite] = useState<boolean | null>(null)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)

  // Derived state: Use optimistic value if set, otherwise source of truth
  const isFavorited = optimisticFavorite !== null
    ? optimisticFavorite
    : favoritesStore.isFavorited(flyer.id)


  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault() // ⛔ prevent Link navigation
    e.stopPropagation() // ⛔ stop event bubbling

    if (!user) {
      authStore.handleAuthModal()
      return
    }

    if (isTogglingFavorite) return

    setIsTogglingFavorite(true)

    // 🚀 OPTIMISTIC UI UPDATE
    const newState = !isFavorited
    setOptimisticFavorite(newState)

    try {
      await favoritesStore.toggleFavorite(user.id, Number(flyer.id))

      // On success, clear optimistic state (store will be updated)
      // Slight delay to ensure store has caught up or just let it sync
      setOptimisticFavorite(null)

      if (favoritesStore.isFavorited(flyer.id)) {
        toast.success("Added to favorites!")
      } else {
        toast.success("Removed from favorites")
      }

      onToggleFavorite?.(flyer)
    } catch (error: any) {
      // 🔄 REVERT on error
      setOptimisticFavorite(null)
      toast.error(error.message || "Failed to update favorites")
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  const getPriceColor = (priceType: string) => {
    switch (priceType) {
      case "premium":
        return "bg-[#FFB700CF] text-[#FFF] border border-[#FFB70033]"
      default:
        return "bg-primary/80 border-primary/20"
    }
  }

  // 🎀 Ribbon Logic
  const getPrice = (f: any) => {
    if (typeof f.price === 'number') return f.price;
    if (typeof f.price === 'string') return parseFloat(f.price.replace('$', ''));
    return 0;
  }

  const price = getPrice(flyer);
  const isPremium = price === 40;

  useEffect(() => {
    setIsLoading(true)
  }, [flyer.image_url])

  const handleClick = (e: React.MouseEvent) => {
    if (!onPreview) {
      loadingStore.startLoading("Redirecting...");
      window.scrollTo(0, 0);
    }
    if (onPreview) {
      onPreview(flyer);
    }
  }

  const handleProtectedClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault()
      e.stopPropagation()
      authStore.handleAuthModal()
      return
    }
    handleClick(e)
  }

  const CardContentWithInteraction = (
    <div
      className={cn(
        "group relative bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden transition-all duration-500",
        "hover:scale-[1.03] hover:shadow-[0_20px_40px_-15px_rgba(185,32,37,0.3)] cursor-pointer backdrop-blur-sm",
        selected ? 'ring-2 ring-primary ring-offset-4 ring-offset-black' : ''
      )}
      onClick={handleProtectedClick}
    >
      <FlyerFrame
        flyer={flyer}
        aspectRatio="aspect-[4/5]"
        className="hover:scale-[1.01]"
      />

      {/* Selected Overlay */}
      {selected && (
        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] z-20 flex items-center justify-center">
          <div className="bg-primary text-white p-3 rounded-full shadow-[0_0_20px_rgba(185,32,37,0.5)] transform scale-110 animate-in zoom-in-50 duration-300">
            <Check className="w-8 h-8 stroke-[3px]" />
          </div>
          <div className="absolute bottom-6 text-white font-black text-xs tracking-[0.2em] uppercase">SELECTED</div>
        </div>
      )}

      {/* Favorite Button */}
      <button
        type="button"
        onClick={handleToggleFavorite}
        className={cn(
          "absolute top-4 right-4 z-40 p-2.5 rounded-full transition-all duration-300",
          "backdrop-blur-md border border-white/10 hover:scale-110 active:scale-95",
          isFavorited ? "bg-primary text-white" : "bg-black/40 text-white hover:bg-black/60"
        )}
      >
        <Heart className={cn("w-5 h-5", isFavorited && "fill-current")} />
      </button>

      {/* Price Tag */}
      <div className="absolute bottom-4 left-4 z-40">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-xl shadow-2xl">
          <span className="text-white font-bold text-sm tracking-tight">
            ${price || 0}
          </span>
        </div>
      </div>
    </div>
  )

  if (onPreview) {
    return CardContentWithInteraction
  }

  if (!user) {
    return CardContentWithInteraction
  }

  return (
    <Link
      href={`/flyer/${flyer.id}`}
      scroll={true}
    >
      {CardContentWithInteraction}
    </Link>
  )
}


export const FlyerCard = observer(FlyerCardComponent)
