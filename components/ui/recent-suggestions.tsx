
import React, { useState, useEffect } from 'react';
import { getRecentItems } from '@/lib/autofill';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { History, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecentSuggestionsProps {
    type: 'address' | 'dj' | 'host' | 'presenting';
    onSelect: (value: string) => void;
    currentValue?: string;
}

export const RecentSuggestions: React.FC<RecentSuggestionsProps> = ({ type, onSelect, currentValue }) => {
    const [recent, setRecent] = useState<string[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (open) {
            setRecent(getRecentItems(type));
        }
    }, [open, type]);

    if (recent.length === 0 && !open) {
        // We still want to allow opening to check if there are recent items
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="p-1 text-gray-400 hover:text-primary transition-colors"
                    title={`Recent ${type}s`}
                >
                    <History className="w-4 h-4" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2 bg-black border-gray-800 shadow-xl z-[100]" align="end">
                <div className="flex items-center justify-between mb-2 px-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recent {type}s</span>
                    <button onClick={() => setOpen(false)}><X className="w-3 h-3 text-gray-500 hover:text-white" /></button>
                </div>
                <div className="space-y-1">
                    {recent.length > 0 ? (
                        recent.map((item, i) => (
                            <button
                                key={i}
                                type="button"
                                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-primary/10 hover:text-primary rounded-md transition-all truncate"
                                onClick={() => {
                                    onSelect(item);
                                    setOpen(false);
                                }}
                            >
                                {item}
                            </button>
                        ))
                    ) : (
                        <p className="text-xs text-gray-600 px-2 py-4 text-center">No recent items found</p>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};
