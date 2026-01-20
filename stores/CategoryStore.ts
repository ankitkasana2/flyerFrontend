import { makeAutoObservable, runInAction } from "mobx"
import { getApiUrl } from "@/config/api"

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
        this.fetchCategories()
    }

    async fetchCategories() {
        runInAction(() => {
            this.isLoading = true;
        });
        
        try {
            const res = await fetch(getApiUrl('/api/categories'));
            const data = await res.json();
            if (data.success && Array.isArray(data.categories)) {

                // Sort by rank ascending (1, 2, 3...)
                runInAction(() => {
                    this.categories = data.categories.sort((a: any, b: any) => a.rank - b.rank);
                });
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    // Set reference to flyersStore
    setFlyersStore(store: any) {
        this.flyersStore = store
    }

    // Get all flyers from flyersStore or fallback to empty array
    get allFlyers() {
        return this.flyersStore?.flyers?.length > 0
            ? this.flyersStore.flyers
            : []
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
            this.flyers = allFlyers.filter((fly: any) => fly.isRecentlyAdded || fly.recently_added || fly.recentlyAdded)

            this.flyers.sort((a: any, b: any) => {
                const idA = parseInt(a.id) || 0
                const idB = parseInt(b.id) || 0
                return idB - idA
            })

            this.category = 'Recently Added'
        } else {
            // Dynmaic Category Logic
            let categoryName = cat;

            // Try to find in API categories first
            const apiCategory = this.categories.find((c: any) => {
                const apiSlug = c.name.toLowerCase().replace(/\s+/g, '-');
                return apiSlug === cat || c.name === cat;
            });

            if (apiCategory) {
                categoryName = apiCategory.name;
            } else {
                // Formatting fallback
                if (cat.includes('-')) {
                    categoryName = cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                } else {
                    categoryName = cat;
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
                if (cat.includes('-')) {
                    catName = cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                } else {
                    catName = cat;
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

    }



}
