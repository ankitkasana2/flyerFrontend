import { makeAutoObservable } from "mobx"
import { SAMPLE_FLYERS, FLYER_CATEGORIES } from "@/lib/types"

export type Flyer = {
    id: string
    name: string
    category: string
    price: number
    priceType: "basic" | "regular" | "premium"
    hasPhotos: boolean
    imageUrl: string
    tags: string[]
    isRecentlyAdded?: boolean
    isFeatured?: boolean
}

export class CategoryStore {
    flyers: any[] = []
    category: string = ''
    flyersStore: any = null // Reference to flyersStore

    categories: { id: number; name: string; rank: number }[] = []
    isLoading: boolean = false

    constructor() {
        makeAutoObservable(this)
    }

    async fetchCategories() {
        this.isLoading = true;
        try {
            const res = await fetch('http://193.203.161.174:3007/api/categories');
            const data = await res.json();
            if (data.success && Array.isArray(data.categories)) {
                // Sort by rank ascending (1, 2, 3...)
                this.categories = data.categories.sort((a: any, b: any) => a.rank - b.rank);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        } finally {
            this.isLoading = false;
        }
    }

    // Set reference to flyersStore
    setFlyersStore(store: any) {
        this.flyersStore = store
    }

    // Get all flyers from flyersStore or fallback to SAMPLE_FLYERS
    get allFlyers() {
        return this.flyersStore?.flyers?.length > 0
            ? this.flyersStore.flyers
            : SAMPLE_FLYERS
    }

    // Helper to shuffle an array (Fisher-Yates)
    shuffleArray(array: any[]) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // set initial flyer 
    setFlyer(cat: string) {
        const allFlyers = this.allFlyers

        if (cat == 'Recently Added' || cat == 'recently-added') {
            // Recently Added: KEEP ORDER (Newest to Oldest)
            // Assuming the source 'allFlyers' or 'recentlyAdded' filter returns them 
            // in some reasonable order, or we sort by ID/date here.
            // For now, we trust the filter/source order for "Recently Added".
            this.flyers = allFlyers.filter((fly: any) => fly.isRecentlyAdded || fly.recently_added || fly.recentlyAdded)

            // Explicitly sort by ID descending (proxy for date) if needed, 
            // but usually recently added specific list is already sorted.
            // If we have created_at, we could sort by that.
            this.flyers.sort((a: any, b: any) => {
                const idA = parseInt(a.id) || 0
                const idB = parseInt(b.id) || 0
                return idB - idA
            })

            this.category = 'Recently Added'
        } else if (cat == 'premium-flyers' || cat == 'Premium Flyers') {
            this.category = 'Premium Flyers'
            let filtered = allFlyers.filter((fly: any) => {
                const price = typeof fly.price === 'string' ? parseFloat(fly.price.replace('$', '')) : fly.price
                return price === 40
            })
            // RANDOMIZE
            this.flyers = this.shuffleArray(filtered)
        } else if (cat == 'basic-flyers' || cat == 'Basic Flyers') {
            this.category = 'Basic Flyers'
            let filtered = allFlyers.filter((fly: any) => {
                const price = typeof fly.price === 'string' ? parseFloat(fly.price.replace('$', '')) : fly.price
                return price === 10
            })
            // RANDOMIZE
            this.flyers = this.shuffleArray(filtered)
        } else {
            // For other categories, check if flyer has this category in its categories array
            // First try to find in API-fetched categories, then fall back to static list
            let categoryName = cat;

            // Try to find in API categories first
            const apiCategory = this.categories.find((c: any) => {
                const apiSlug = c.name.toLowerCase().replace(/\s+/g, '-');
                return apiSlug === cat || c.name === cat;
            });

            if (apiCategory) {
                categoryName = apiCategory.name;
            } else {
                // Fall back to static FLYER_CATEGORIES
                const staticCategory = FLYER_CATEGORIES.find(categ => categ.slug === cat);
                if (staticCategory) {
                    categoryName = staticCategory.name;
                }
            }

            this.category = categoryName

            let filtered = allFlyers.filter((fly: any) => {
                // Check if flyer has categories array (API format)
                if (Array.isArray(fly.categories)) {
                    return fly.categories.includes(categoryName)
                }
                // Fallback to old format
                return fly.category === categoryName
            })

            // RANDOMIZE
            this.flyers = this.shuffleArray(filtered)
        }

        // Filter out birthday form type flyers if this.category is not Birthday Flyers
        this.flyers = this.flyers.filter((f: any) => {
            if (f.form_type === 'Birthday') {
                return this.category === 'Birthday Flyers';
            }
            return true;
        })
    }


    // handle filter 
    setFlyerByFilter(val: string[]) {
        const allFlyers = this.allFlyers

        // Start from flyers of the currently selected category
        let filteredFlyers = this.flyers;

        if (val.length === 0) {
            // No filters selected, show all flyers in current category
            filteredFlyers = this.getFlyersByCategory(this.category);
        } else {
            // Filter current category flyers based on selected price
            filteredFlyers = this.getFlyersByCategory(this.category)
                .filter((flyer: any) => {
                    const price = typeof flyer.price === 'string' ? parseFloat(flyer.price.replace('$', '')) : flyer.price

                    // Map price to priceType
                    let priceType = 'regular'
                    if (price === 10) priceType = 'basic'
                    else if (price === 40) priceType = 'premium'
                    else if (price === 15) priceType = 'regular'

                    return val.includes(priceType)
                });
        }

        this.flyers = filteredFlyers;
    }


    // get flyers according to category
    getFlyersByCategory(cat: string) {
        const allFlyers = this.allFlyers
        let result = [];
        let resolvedCategoryName = cat;

        if (cat === 'Recently Added' || cat === 'recently-added') {
            result = allFlyers.filter((fly: any) => fly.isRecentlyAdded || fly.recently_added || fly.recentlyAdded);
            resolvedCategoryName = 'Recently Added';
        } else if (cat === 'premium-flyers' || cat === 'Premium Flyers') {
            result = allFlyers.filter((fly: any) => {
                const price = typeof fly.price === 'string' ? parseFloat(fly.price.replace('$', '')) : fly.price
                return price === 40
            });
            resolvedCategoryName = 'Premium Flyers';
        } else if (cat === 'basic-flyers' || cat === 'Basic Flyers') {
            result = allFlyers.filter((fly: any) => {
                const price = typeof fly.price === 'string' ? parseFloat(fly.price.replace('$', '')) : fly.price
                return price === 10
            });
            resolvedCategoryName = 'Basic Flyers';
        } else {
            // Try to find in API categories first, then fall back to static list
            let catName = cat;

            const apiCategory = this.categories.find((c: any) => {
                const apiSlug = c.name.toLowerCase().replace(/\s+/g, '-');
                return apiSlug === cat || c.name === cat;
            });

            if (apiCategory) {
                catName = apiCategory.name;
            } else {
                const staticCategory = FLYER_CATEGORIES.find(c => c.slug === cat);
                if (staticCategory) {
                    catName = staticCategory.name;
                }
            }
            resolvedCategoryName = catName;

            result = allFlyers.filter((fly: any) => {
                // Check if flyer has categories array (API format)
                if (Array.isArray(fly.categories)) {
                    return fly.categories.includes(catName)
                }
                // Fallback to old format
                return fly.category === catName
            });
        }

        // Filter out birthday form type flyers if resolved category is not Birthday Flyers
        return result.filter((f: any) => {
            if (f.form_type === 'Birthday') {
                return resolvedCategoryName === 'Birthday Flyers';
            }
            return true;
        });
    }

    // Search flyers by query
    searchFlyers(query: string) {
        const allFlyers = this.allFlyers
        const searchLower = query.toLowerCase().trim()

        if (!searchLower) {
            this.flyers = allFlyers
            this.category = 'All Flyers'
            return
        }

        console.log("🔍 Searching flyers for:", searchLower)

        this.flyers = allFlyers.filter((fly: any) => {
            // Search in name
            const nameMatch = fly.name?.toLowerCase().includes(searchLower)

            // Search in title
            const titleMatch = fly.title?.toLowerCase().includes(searchLower)

            // Search in categories
            const categoryMatch = Array.isArray(fly.categories)
                ? fly.categories.some((cat: string) => cat.toLowerCase().includes(searchLower))
                : fly.category?.toLowerCase().includes(searchLower)

            // Search in tags
            const tagsMatch = Array.isArray(fly.tags)
                ? fly.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
                : false

            return nameMatch || titleMatch || categoryMatch || tagsMatch
        })

        this.category = `Search Results for "${query}"`
        console.log("✅ Found", this.flyers.length, "flyers")
    }



}
