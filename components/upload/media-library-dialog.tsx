"use client"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MediaLibrary } from "./media-library"
import { LibraryItem } from "@/lib/uploads"
import { ImageIcon } from "lucide-react"
import { useState } from "react"

interface MediaLibraryDialogProps {
    userId: string
    type?: "image" | "logo"
    onSelect: (items: LibraryItem[]) => void
    trigger?: React.ReactNode
    multiple?: boolean
    maxSelect?: number
}

export function MediaLibraryDialog({ 
    userId, 
    type, 
    onSelect, 
    trigger,
    multiple = false,
    maxSelect = 1
}: MediaLibraryDialogProps) {
    const [open, setOpen] = useState(false)

    const handleConfirm = (items: LibraryItem[]) => {
        onSelect(items)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Media Library
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-0 border-none bg-transparent">
                <MediaLibrary 
                    userId={userId} 
                    type={type} 
                    multiple={multiple}
                    maxSelect={maxSelect}
                    onConfirm={handleConfirm} 
                    onCancel={() => setOpen(false)} 
                />
            </DialogContent>
        </Dialog>
    )
}
