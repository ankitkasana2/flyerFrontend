export type Flyer = {
    id: string;
    name: string;
    category: string;
    price: number;
    priceType: "basic" | "regular" | "premium";
    hasPhotos: boolean;
    imageUrl: string;
    tags: string[];
    isRecentlyAdded?: boolean;
    isFeatured?: boolean;
}

// These are being phased out in favor of API data
export const SAMPLE_FLYERS: Flyer[] = [];
export const FLYER_CATEGORIES: string[] = [];

export const getCategoriesWithFlyers = (flyers: Flyer[] = []) => {
    if (!flyers) return [];
    // Helper to get unique categories with id and name format for the filter component
    // Since the filters expect objects with id/slug/name, but this function was processing raw strings
    // We'll map the strings to objects if needed, OR we should update the filter component to use the store.
    // However, looking at the filter component (line 91: c.slug === category), it expects objects with slug/name.
    // BUT this function returns string[] (Array.from(set)). 
    // Wait, FlyerFilters expects {id, slug, name}[] from getCategoriesWithFlyers?
    // Let's check FlyerFilters line 91: categories.find((c) => c.slug === category)?.name
    // This implies categories is an array of objects!
    // But this function returns Array<string>.
    // There is a type mismatch or I am looking at the wrong version of types.ts?
    // In step 280, line 30 calls getCategoriesWithFlyers().
    // Line 124 maps over categories -> category.id, category.slug.
    // So getCategoriesWithFlyers MUST return objects.
    // BUT in step 283, it returns Array.from(Set<string>).
    // This explains why it might be crashing or behaving weirdly, but the forEach error is definitely from the missing argument.
    
    // Changing the implementation to return empty array to stop the crash.
    // The filter component seems to be broken or using a different version of this function in my mind vs reality.
    // Let's just fix the crash first.
    const categories = new Set<string>();
    flyers.forEach(f => categories.add(f.category));
    return Array.from(categories).map((c, i) => ({ id: i, name: c, slug: c }));
}

export const getCategoryCounts = (flyers: Flyer[] = []) => {
    if (!flyers) return {};
    const counts: Record<string, number> = {};
    flyers.forEach(f => {
        counts[f.category] = (counts[f.category] || 0) + 1;
    });
    return counts;
}
