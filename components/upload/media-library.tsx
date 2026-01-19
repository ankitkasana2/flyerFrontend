"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { listLibrary, removeFromLibrary, type LibraryItem } from "@/lib/uploads"
import { Trash2, Loader2, Check, ImageIcon } from "lucide-react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MediaLibraryProps {
  userId: string
  type?: "image" | "logo"
  multiple?: boolean
  maxSelect?: number
  onConfirm: (items: LibraryItem[]) => void
  onCancel: () => void
}

export function MediaLibrary({ userId, type, multiple = true, maxSelect = 5, onConfirm, onCancel }: MediaLibraryProps) {
  const [search, setSearch] = useState("")
  const [items, setItems] = useState<LibraryItem[]>([])
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("all") // Always default to "all" to show everything

  const loadItems = async () => {
    setIsLoading(true)
    try {
      // Fetch all items to allow user to switch categories in dialog
      const data = await listLibrary(userId)
      setItems(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [userId]) // Only reload when userId changes

  const filtered = useMemo(() => {
    let next = items
    if (activeTab !== "all") {
      next = next.filter((i) => i.type === activeTab)
    }
    if (search.trim()) {
      next = next.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    }
    return next
  }, [items, search, activeTab])

  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = { ...prev }
      if (multiple) {
        if (next[id]) {
          delete next[id]
        } else {
          if (selectedCount < maxSelect) next[id] = true
        }
      } else {
        // single-select
        return { [id]: true }
      }
      return next
    })
  }

  const confirm = () => {
    const result = items.filter((i) => selected[i.id])
    onConfirm(result.slice(0, maxSelect))
  }

  const handleRemove = async (id: string) => {
    if (!globalThis.confirm("Delete this item?")) return
    setIsLoading(true)
    await removeFromLibrary(userId, id)
    // optimistic update or reload
    await loadItems()

    setSelected((prev) => {
      const n = { ...prev }
      delete n[id]
      return n
    })
    setIsLoading(false)
  }

  return (
    <Card className="bg-card border-border border-0 shadow-2xl">
      <CardHeader className="flex flex-col gap-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-card-foreground text-xl">Media Library</CardTitle>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            {filtered.length} items
          </Badge>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Input
              placeholder="Search media..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-input border-border pl-3 shadow-inner h-10
                focus-visible:!ring-0 focus-visible:!outline-none
                focus-visible:!shadow-[0_0_15px_rgba(185,32,37,0.4)]
                transition-all duration-300"
            />
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="bg-muted/50 border border-border">
              <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
              <TabsTrigger value="image" className="text-xs px-3">Images</TabsTrigger>
              <TabsTrigger value="logo" className="text-xs px-3">Logos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[400px] pr-4 -mr-2">
          {isLoading && items.length === 0 ? (
            <div className="flex h-full min-h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading your media...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-medium">No media found.</p>
              <p className="text-xs text-muted-foreground/70 mt-1 max-w-[200px]">
                {activeTab !== "all" 
                  ? `Try checking the "All" category or search for something else.` 
                  : "Upload assets in your profile to see them here."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-1">
              {filtered.map((item) => {
                const isSelected = !!selected[item.id]
                return (
                  <div key={item.id} className="relative group">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleSelect(item.id)}
                      onKeyDown={(e) => e.key === 'Enter' && toggleSelect(item.id)}
                      className={`block w-full aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                        isSelected 
                          ? "border-primary shadow-[0_0_15px_rgba(185,32,37,0.4)] scale-[0.98]" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.dataUrl || "/placeholder.svg"}
                        alt={item.name}
                        className={`w-full h-full object-cover transition-transform duration-500 ${isSelected ? "scale-110" : "group-hover:scale-105"}`}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="bg-primary text-white rounded-full p-1 shadow-lg">
                            <Check className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 px-1">
                      <p className="text-[10px] font-medium text-foreground truncate">{item.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Badge variant="outline" className={`text-[8px] uppercase px-1 py-0 h-3 ${item.type === 'logo' ? 'border-primary/50 text-primary' : ''}`}>
                          {item.type}
                        </Badge>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item.id)
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/60 hover:bg-red-600 text-white rounded-lg p-1.5 backdrop-blur-sm"
                      title="Remove from library"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button 
            variant="outline" 
            className="bg-transparent border-border hover:bg-muted" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirm} 
            disabled={selectedCount === 0 || isLoading}
            className="px-6 shadow-lg shadow-primary/20"
          >
            Use Selected {selectedCount > 0 ? `(${selectedCount})` : ""}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
