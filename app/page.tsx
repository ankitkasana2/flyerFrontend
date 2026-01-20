'use client'

import FlyersSection from "@/components/home/FlyersSection"
import HeroSection from "@/components/home/HeroSection"

import { observer } from "mobx-react-lite"
import { useStore } from "@/stores/StoreProvider"

import React, { useEffect, useState } from "react"

type HomeSectionProps = {
  type: {
    id: string;
    name: string;
    slug: string;
    homePage: boolean;
  };

}



const HomePage: React.FC<HomeSectionProps> = () => {
  const { flyersStore, authStore, favoritesStore, categoryStore } = useStore()
  const [categories, setCategories] = useState<any[]>([])

  // Fetch flyers on mount
  useEffect(() => {
    if (!flyersStore.flyers.length && !flyersStore.loading) {
      flyersStore.fetchFlyers()
    }
  }, [flyersStore])

  // Fetch favorites on mount if user is logged in
  useEffect(() => {
    if (authStore.user?.id) {

      favoritesStore.fetchFavorites(authStore.user.id)
    }
  }, [authStore.user?.id, favoritesStore])

  // Update categories from store based on API rank
  useEffect(() => {
    if (categoryStore.categories.length > 0) {
      // The categoryStore.categories is already sorted by rank in the store's fetchCategories method.
      // We just need to map them to the format expected by the Home page components.
      const mappedCategories = categoryStore.categories.map((cat: any) => ({
        id: String(cat.id),
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
        homePage: true,
        rank: cat.rank
      }));

      setCategories(mappedCategories);
    }
  }, [categoryStore.categories]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Loading state removed */}

      {/* Error state */}
      {flyersStore.error && (
        <section className="py-8 px-5">
          <div className="text-center text-red-500">
            <p>Error loading flyers: {flyersStore.error}</p>
          </div>
        </section>
      )}

      {/* Categories with flyers */}
      {!flyersStore.loading && categories.length > 0 &&
        categories.map(cat => <FlyersSection key={cat.id} type={cat} />)
      }

      {/* No flyers state */}
      {!flyersStore.loading && !flyersStore.error && categories.length === 0 && (
        <section className="py-8 px-5">
          <div className="text-center text-muted-foreground">
            <p>No flyers available at the moment.</p>
          </div>
        </section>
      )}




    
    </div>
  )
}

export default observer(HomePage);




