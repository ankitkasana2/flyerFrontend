'use client'

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FlyerCard } from "@/components/flyer/flyer-card"
import { Star, Zap, Clock, Shield } from "lucide-react"
import { getDynamicCategoriesFromFlyers } from "@/lib/types"
import Link from "next/link"
import FlyersSection from "@/components/home/FlyersSection"
import HeroSection from "@/components/home/HeroSection"

import { observer } from "mobx-react-lite"
import { useStore } from "@/stores/StoreProvider"
import { toJS } from "mobx"
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

  // Fetch categories on mount
  useEffect(() => {
    categoryStore.fetchCategories();
  }, [categoryStore]);

  // Fetch favorites on mount if user is logged in
  useEffect(() => {
    if (authStore.user?.id) {
      console.log("🏠 Home page: Fetching favorites for user:", authStore.user.id)
      favoritesStore.fetchFavorites(authStore.user.id)
    }
  }, [authStore.user?.id, favoritesStore])

  // Update categories from store and specific ordering
  useEffect(() => {
    // Expected order of categories
    const ORDERED_SLUGS = [
      'premium-flyers',
      'basic-flyers',
      'dj-image-and-artist',
      'ladies-night',
      'brunch',
      'summer',
      'hookah-flyers',
      'clean-flyers',
      'drink-flyers',
      'birthday-flyers'
    ];

    if (categoryStore.categories.length > 0) {
      // 1. Map API categories to our format
      const mappedCategories = categoryStore.categories.map((cat: any) => ({
        id: String(cat.id),
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
        homePage: true
      }));

      // 2. Sort categories based on the fixed list
      const sortedCategories: any[] = [];
      const remainingCategories = [...mappedCategories];

      ORDERED_SLUGS.forEach(slug => {
        const index = remainingCategories.findIndex(c =>
          (c.slug === slug ||
            c.name.toLowerCase() === slug.replace(/-/g, ' ') || // Handle space vs dash
            (slug === 'dj-image-and-artist' && c.name.toLowerCase().includes('artist'))) &&
          c.slug !== 'recently-added' && c.name !== 'Recently Added'
        );

        if (index !== -1) {
          sortedCategories.push(remainingCategories[index]);
          remainingCategories.splice(index, 1);
        }
      });

      // Add any remaining categories at the end (fallback), EXCLUDING "Recently Added" if it exists
      sortedCategories.push(...remainingCategories.filter(c =>
        c.slug !== 'recently-added' && c.name.toLowerCase() !== 'recently added'
      ));

      // 3. Prepend "Recently Added" as the very first item
      // It's not a real category in DB, so we construct it manually
      const recentlyAddedSection = {
        id: 'recent',
        name: 'Recently Added',
        slug: 'recently-added',
        homePage: true
      };

      setCategories([recentlyAddedSection, ...sortedCategories]);
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




      {/* Features Section */}
      {/* <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose Grodify?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create professional event flyers quickly and easily.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Lightning Fast</h3>
                <p className="text-muted-foreground text-sm">
                  Get your custom flyers in as little as 1 hour with our express delivery.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Premium Quality</h3>
                <p className="text-muted-foreground text-sm">
                  Professional designs created by expert designers for maximum impact.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">24/7 Service</h3>
                <p className="text-muted-foreground text-sm">
                  Order anytime, anywhere. Our team works around the clock for you.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Secure & Safe</h3>
                <p className="text-muted-foreground text-sm">
                  SSL encryption and secure payments. Your data is always protected.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}

      {/* Pricing Preview */}
      {/* <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">Choose the perfect plan for your needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Basic</h3>
                <div className="text-3xl font-bold text-primary mb-4">$10</div>
                <p className="text-muted-foreground text-sm mb-6">Perfect for simple events</p>
                <Button variant="outline" className="w-full bg-transparent">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border ring-2 ring-primary">
              <CardContent className="p-6 text-center">
                <Badge className="mb-4">Most Popular</Badge>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Regular</h3>
                <div className="text-3xl font-bold text-primary mb-4">$15</div>
                <p className="text-muted-foreground text-sm mb-6">Great for most events</p>
                <Button className="w-full">Get Started</Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Premium</h3>
                <div className="text-3xl font-bold text-primary mb-4">$40</div>
                <p className="text-muted-foreground text-sm mb-6">For premium events</p>
                <Button variant="outline" className="w-full bg-transparent">
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}
    </div>
  )
}

export default observer(HomePage);




