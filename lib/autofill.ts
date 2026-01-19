
const MAX_RECENT_ITEMS = 5;

export const saveRecentItem = (key: string, value: string) => {
    if (!value || value.trim() === '') return;
    
    try {
        const stored = localStorage.getItem(`recent_${key}`);
        let items: string[] = stored ? JSON.parse(stored) : [];
        
        // Remove if already exists to move to top
        items = items.filter(item => item.toLowerCase() !== value.toLowerCase());
        
        // Add to top
        items.unshift(value);
        
        // Limit
        items = items.slice(0, MAX_RECENT_ITEMS);
        
        localStorage.setItem(`recent_${key}`, JSON.stringify(items));
    } catch (e) {
        console.error('Error saving recent item:', e);
    }
};

export const getRecentItems = (key: string): string[] => {
    try {
        const stored = localStorage.getItem(`recent_${key}`);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Error getting recent items:', e);
        return [];
    }
};
