"use client"
import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { FlyerCard } from "@/components/flyer/flyer-card"
import { FlyerFilters } from "@/components/flyer/flyer-filters"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type Flyer } from "@/lib/types"
import { observer } from "mobx-react-lite"
import { useStore } from "@/stores/StoreProvider"
import { Grid, List } from "lucide-react"

interface FilterState {
  search: string
  categories: string[]
  priceRange: string
  hasPhotos: boolean | null
  sortBy: string
}

const FlyersPage = () => {
  const { flyersStore, categoryStore } = useStore()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  
  useEffect(() => {
    if (flyersStore.flyers.length === 0) flyersStore.fetchFlyers()
    if (categoryStore.categories.length === 0) categoryStore.fetchCategories()
  }, [])

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    categories: [],
    priceRange: "",
    hasPhotos: null,
    sortBy: "newest",
  })

  const filteredFlyers = useMemo(() => {
    let result = [...flyersStore.flyers]

    // Search filter
    if (filters.search) {
      result = result.filter(
        (flyer) =>
          (flyer: any) =>
            (flyer.name || flyer.title)?.toLowerCase().includes(filters.search.toLowerCase()) ||
            (Array.isArray(flyer.categories) ? flyer.categories.some((c: string) => c.toLowerCase().includes(filters.search.toLowerCase())) : flyer.category?.toLowerCase().includes(filters.search.toLowerCase())) ||
            (Array.isArray(flyer.tags) && flyer.tags.some((tag: string) => tag.toLowerCase().includes(filters.search.toLowerCase()))),
      )
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter((flyer: any) => {
        const catList = Array.isArray(flyer.categories) ? flyer.categories : [flyer.category]
        return catList.some((cat: string) => {
           const slug = cat.toLowerCase().replace(/\s+/g, '-')
           return filters.categories.includes(slug)
        })
      })
    }

    // Price range filter
    if (filters.priceRange) {
      switch (filters.priceRange) {
        case "basic":
          result = result.filter((flyer) => flyer.priceType === "basic")
          break
        case "regular":
          result = result.filter((flyer) => flyer.priceType === "regular")
          break
        case "premium":
          result = result.filter((flyer: any) => {
            const price = typeof flyer.price === 'string' ? parseFloat(flyer.price.replace('$', '')) : flyer.price
            return price === 40
          })
          break
        case "10-15":
          result = result.filter((flyer) => flyer.price >= 10 && flyer.price <= 15)
          break
        case "15-40":
          result = result.filter((flyer) => flyer.price >= 15 && flyer.price <= 40)
          break
      }
    }

    // Photo filter
    if (filters.hasPhotos !== null) {
      result = result.filter((flyer) => flyer.hasPhotos === filters.hasPhotos)
    }

    // Sort
    switch (filters.sortBy) {
      case "newest":
        result.sort((a, b) => (b.isRecentlyAdded ? 1 : 0) - (a.isRecentlyAdded ? 1 : 0))
        break
      case "popular":
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
        break
      case "price-low":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        result.sort((a, b) => b.price - a.price)
        break
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return result
  }, [filters])

  const clearFilters = () => {
    setFilters({
      search: "",
      categories: [],
      priceRange: "",
      hasPhotos: null,
      sortBy: "newest",
    })
  }

  const handlePreview = (flyer: Flyer) => {
    // TODO: Open preview modal
  }

  const handleAddToCart = (flyer: Flyer) => {
    // TODO: Add to cart functionality
  }

  const handleToggleFavorite = (flyer: Flyer) => {
    // TODO: Toggle favorite functionality
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Browse Flyers</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Discover over 10,000+ professional flyer templates for your events
          </p>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categoryStore.categories.slice(0, 8).map((category) => {
              const slug = category.name.toLowerCase().replace(/\s+/g, '-')
              return (
                <Badge
                  key={category.id}
                  variant={filters.categories.includes(slug) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => {
                    const newCategories = filters.categories.includes(slug)
                      ? filters.categories.filter((c) => c !== slug)
                      : [...filters.categories, slug]
                    setFilters({ ...filters, categories: newCategories })
                  }}
                >
                  {category.name}
                </Badge>
              )
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <FlyerFilters filters={filters} onFiltersChange={setFilters} onClearFilters={clearFilters} />
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">{filteredFlyers.length} flyers found</span>
            {filteredFlyers.length !== flyersStore.flyers.length && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Show All ({flyersStore.flyers.length})
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("grid")}>
              <Grid className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("list")}>
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Flyers Grid */}
        {filteredFlyers.length > 0 ? (
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1 md:grid-cols-2 gap-4"
            }`}
          >
            {filteredFlyers.map((flyer) => (
              <FlyerCard
                key={flyer.id}
                flyer={flyer}
                onPreview={handlePreview}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">No flyers found matching your criteria</p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default observer(FlyersPage)
