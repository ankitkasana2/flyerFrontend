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

export const getCategoriesWithFlyers = (flyers: Flyer[]) => {
    const categories = new Set<string>();
    flyers.forEach(f => categories.add(f.category));
    return Array.from(categories);
}

export const getCategoryCounts = (flyers: Flyer[]) => {
    const counts: Record<string, number> = {};
    flyers.forEach(f => {
        counts[f.category] = (counts[f.category] || 0) + 1;
    });
    return counts;
}
