'use client'
import React, { useState, useMemo, useEffect } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { observer } from "mobx-react-lite"
import { useStore } from "@/stores/StoreProvider"

const pricing = [
    { id: 'basic', label: '10' },
    { id: 'regular', label: '15' },
    { id: 'premium', label: '40' },
]

const FilterBar = () => {

    const { filterBarStore, flyersStore, categoryStore } = useStore()

    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedPrices, setSelectedPrices] = useState<string[]>([])
    const [selectedTypes, setSelectedTypes] = useState<string[]>([])

    // Unified function to apply all filters together
    const applyAllFilters = (categories: string[], prices: string[], types: string[]) => {


        const allFlyers = flyersStore.flyers
        let filtered = allFlyers

        // Step 1: Filter by categories (if any selected)
        if (categories.length > 0) {
            filtered = filtered.filter((flyer: any) => {
                if (Array.isArray(flyer.categories)) {
                    return categories.some(cat => flyer.categories.includes(cat))
                }
                return categories.includes(flyer.category)
            })

        }

        // Step 2: Filter by price (if any selected)
        if (prices.length > 0) {
            filtered = filtered.filter((flyer: any) => {
                const price = typeof flyer.price === 'string'
                    ? parseFloat(flyer.price.replace('$', ''))
                    : flyer.price

                let priceType = 'regular'
                if (price === 10) priceType = 'basic'
                else if (price === 40) priceType = 'premium'
                else if (price === 15) priceType = 'regular'

                return prices.includes(priceType)
            })

        }

        // Step 3: Filter by type (if any selected)
        if (types.length > 0) {
            filtered = filtered.filter((flyer: any) => {
                const hasPhotos = flyer.hasPhotos || flyer.has_photos

                // Check if flyer matches ANY of the selected types (OR logic)
                return types.some(type => {
                    if (type === 'info') {
                        return !hasPhotos  // Info only (no photos)
                    }
                    if (type === 'photos') {
                        return hasPhotos  // With photos
                    }
                    return false
                })
            })

        }

        // Update category store
        categoryStore.flyers = filtered

        // Set category name
        if (categories.length > 0) {
            categoryStore.category = categories.join(', ')
        } else if (categoryStore.category) {
            // Keep current category if no category filter
        } else {
            categoryStore.category = 'All Flyers'
        }


    }

    const toggleCategory = (categoryName: string) => {
        const newSelected = selectedCategories.includes(categoryName)
            ? selectedCategories.filter((c) => c !== categoryName)
            : [...selectedCategories, categoryName]

        setSelectedCategories(newSelected)
        filterBarStore.categoryFilter(categoryName)

        // Apply all filters together
        applyAllFilters(newSelected, selectedPrices, selectedTypes)
    }

    const togglePrice = (id: string) => {
        const newSelected = selectedPrices.includes(id)
            ? selectedPrices.filter((c) => c !== id)
            : [...selectedPrices, id]

        setSelectedPrices(newSelected)
        filterBarStore.priceFilter(id)

        // Apply all filters together
        applyAllFilters(selectedCategories, newSelected, selectedTypes)
    }

    const toggleType = (type: string) => {
        const newSelected = selectedTypes.includes(type)
            ? selectedTypes.filter((t) => t !== type)
            : [...selectedTypes, type]

        setSelectedTypes(newSelected)
        filterBarStore.typeFilter(type)

        // Apply all filters together
        applyAllFilters(selectedCategories, selectedPrices, newSelected)
    }

    useEffect(() => {
        if (!flyersStore.flyers.length) {
            flyersStore.fetchFlyers()
        }
    }, [flyersStore])

    const availableCategories = useMemo(() => {
        if (categoryStore.categories.length > 0) {
            return categoryStore.categories.map((c: any) => ({
                id: String(c.id),
                name: c.name,
                slug: c.name.toLowerCase().replace(/\s+/g, '-'),
                homePage: true
            }));
        }
        return []
    }, [categoryStore.categories])



    return (
        <div className='flex flex-col gap-6 h-full p-3'>
            {/* category  */}
            <div className='flex flex-col gap-2'>
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 px-1">Category</h3>
                <div className='p-3 rounded-2xl bg-zinc-900/40 backdrop-blur-md border border-white/5 shadow-xl max-h-48 overflow-y-auto hide-scrollbar transition-all hover:border-primary/20'>
                    <ul className="space-y-3">
                        {availableCategories.map((cat) => (
                            <li key={cat.name} className="flex items-center gap-3 group">
                                <Checkbox
                                    id={cat.name}
                                    checked={selectedCategories.includes(cat.name)}
                                    onCheckedChange={() => toggleCategory(cat.name)}
                                    className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <Label className='text-sm font-medium text-zinc-400 group-hover:text-white cursor-pointer transition-colors' htmlFor={cat.name}>
                                    {cat.name}
                                </Label>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* price range  */}
            <div className='flex flex-col gap-2'>
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 px-1">Price</h3>
                <div className='p-3 rounded-2xl bg-zinc-900/40 backdrop-blur-md border border-white/5 shadow-xl transition-all hover:border-primary/20'>
                    <ul className="space-y-3">
                        {pricing.map((price) => (
                            <li key={price.label} className="flex items-center gap-3 group">
                                <Checkbox
                                    id={price.label}
                                    checked={selectedPrices.includes(price.id)}
                                    onCheckedChange={() => togglePrice(price.id)}
                                    className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <Label className='text-sm font-medium text-zinc-400 group-hover:text-white cursor-pointer transition-colors' htmlFor={price.label}>${price.label}</Label>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* type  */}
            <div className='flex flex-col gap-2'>
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 px-1">Template Type</h3>
                <div className='p-3 rounded-2xl bg-zinc-900/40 backdrop-blur-md border border-white/5 shadow-xl transition-all hover:border-primary/20'>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3 group">
                            <Checkbox
                                id='info'
                                checked={selectedTypes.includes('info')}
                                onCheckedChange={() => toggleType('info')}
                                className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <Label className='text-sm font-medium text-zinc-400 group-hover:text-white cursor-pointer transition-colors' htmlFor='info'>Info Only</Label>
                        </li>
                        <li className="flex items-center gap-3 group">
                            <Checkbox
                                id='photos'
                                checked={selectedTypes.includes('photos')}
                                onCheckedChange={() => toggleType('photos')}
                                className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <Label className='text-sm font-medium text-zinc-400 group-hover:text-white cursor-pointer transition-colors' htmlFor='photos'>With Photos</Label>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default observer(FilterBar)