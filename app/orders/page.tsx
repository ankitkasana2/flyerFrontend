"use client"

import { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { useStore } from "@/stores/StoreProvider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, Package, Clock, DollarSign, User, Users, Image as ImageIcon, MapPin, FileText, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getApiUrl } from "@/config/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DJ {
  name: string
  image?: string | null
  image_url?: string | null
}

interface Host {
  name: string
  image?: string | null
  image_url?: string | null
}

interface Sponsor {
  name: string | { name: string }
  image?: string | null
  image_url?: string | null
}

interface Order {
  id: number
  presenting: string
  event_title: string
  event_date: string
  address_phone: string
  flyer_info: string
  venue_logo: string | null
  image_url: string | null
  djs: DJ[]
  host: Host
  sponsors: Sponsor[]
  delivery_time: string
  custom_notes: string
  total_price: number | null
  status: string
  created_at: string
  story_size_version?: boolean
  custom_flyer?: boolean
  animated_flyer?: boolean
  instagram_post_size?: boolean
  venue_text?: string
  flyer_is?: number | string
  flyer_id?: number | string
}

interface OrdersResponse {
  success: boolean
  count: number
  orders: Order[]
}

const OrdersPage = observer(() => {
  const { authStore } = useStore()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [flyerMap, setFlyerMap] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchFlyers()
  }, [])

  const fetchFlyers = async () => {
    try {
      const response = await fetch('http://193.203.161.174:3007/api/flyers')
      if (response.ok) {
        const data = await response.json()
        const map: Record<string, string> = {}
        data.forEach((f: any) => {
          map[String(f.id)] = f.image_url || f.imageUrl || f.image
        })
        setFlyerMap(map)
      }
    } catch (err) {
      console.error('❌ Error fetching flyers for map:', err)
    }
  }

  useEffect(() => {
    if (authStore.user?.id) {
      fetchOrders()
    } else {
      setLoading(false)
    }
  }, [authStore.user?.id])

  const fetchOrders = async () => {
    if (!authStore.user?.id) return

    setLoading(true)
    try {
      const response = await fetch(`http://193.203.161.174:3007/api/orders/user/${authStore.user.id}`)

      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data: OrdersResponse = await response.json()

      if (data.success) {
        setOrders(data.orders)
      } else {
        toast.error('Failed to load orders')
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.event_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.presenting.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm)
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'processing':
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'cancelled':
      case 'canceled':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const getSponsorName = (sponsor: Sponsor): string => {
    if (typeof sponsor.name === 'string') {
      return sponsor.name
    } else if (sponsor.name && typeof sponsor.name === 'object' && 'name' in sponsor.name) {
      return sponsor.name.name || ''
    }
    return ''
  }

  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return null
    if (url.startsWith('http') || url.startsWith('data:')) return url
    // If it's a relative path, prepend the API base URL
    return `${getApiUrl()}${url.startsWith('/') ? '' : '/'}${url}`
  }

  if (!authStore.user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your orders</h1>
          <Button onClick={() => router.push('/')} className="bg-primary hover:bg-red-600">
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-gray-400">Track and manage your flyer orders ({orders.length} total)</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by event title, presenter, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-800 text-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-gray-900 border-gray-800 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="bg-gray-900 border-gray-800 hover:border-primary/50 transition-all">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Flyer Image */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-32 rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
                        {/* 
                          UI Hierarchy for Images:
                          1. Direct image_url if provided (for custom orders)
                          2. Template image from our pre-fetched map using flyer_is
                          3. Venue Logo as literal fallback
                          4. Placeholder icon
                        */}
                        {getImageUrl(order.image_url || flyerMap[String(order.flyer_is || order.flyer_id)] || order.venue_logo) ? (
                          <img
                            src={getImageUrl(order.image_url || flyerMap[String(order.flyer_is || order.flyer_id)] || order.venue_logo) || ''}
                            alt={order.event_title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              if (target.parentElement) {
                                target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>';
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-600" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-white truncate">{order.event_title}</h3>
                          <p className="text-xs text-gray-400 truncate">by {order.presenting}</p>
                        </div>
                        <Badge className={`${getStatusColor(order.status)} border text-xs flex-shrink-0`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 text-xs">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Package className="w-3 h-3 text-primary flex-shrink-0" />
                          <span className="truncate">#{order.id}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Calendar className="w-3 h-3 text-primary flex-shrink-0" />
                          <span className="truncate">{formatDate(order.event_date)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-3 h-3 text-primary flex-shrink-0" />
                          <span className="truncate">{order.delivery_time}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <DollarSign className="w-3 h-3 text-primary flex-shrink-0" />
                          <span className="truncate font-semibold text-white">
                            {order.total_price
                              ? `$${Number(order.total_price).toFixed(2)}`
                              : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Compact Details */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                        {order.djs && order.djs.length > 0 && order.djs.some(dj => dj.name) && (
                          <span className="truncate">
                            <span className="text-gray-500">DJs:</span> {order.djs.map(dj => dj.name).filter(name => name).join(', ')}
                          </span>
                        )}
                        {order.host && order.host.name && (
                          <span className="truncate">
                            <span className="text-gray-500">Host:</span> {order.host.name}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        <Button
                           variant="outline"
                          size="sm"
                          className="h-7 text-xs border-primary text-primary hover:bg-primary hover:text-white"
                          onClick={() => {
                            setSelectedOrder(order)
                            setIsDetailsOpen(true)
                          }}
                        >
                          View Details
                        </Button>
                        {order.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-gray-700 hover:bg-gray-800"
                            onClick={() => {
                              toast.info('Reorder functionality coming soon!')
                            }}
                          >
                            Reorder
                          </Button>
                        )}
                        {order.status.toLowerCase() === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-red-900/50 text-red-500 hover:bg-red-900/20"
                            onClick={() => {
                              toast.info('To cancel this order, please contact our support team at support@grodify.com.')
                            }}
                          >
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No orders found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "You haven't placed any orders yet"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button
                  className="bg-primary hover:bg-red-600"
                  onClick={() => router.push('/categories')}
                >
                  Browse Flyers
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-950 border-gray-800 text-white p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-2xl font-bold text-primary mb-1">
                  {selectedOrder?.event_title}
                </DialogTitle>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="font-mono bg-gray-900 px-2 py-0.5 rounded">Order #{selectedOrder?.id}</span>
                  <span>•</span>
                  <span>{selectedOrder && formatDate(selectedOrder.created_at)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {selectedOrder && (
                  <Badge className={`${getStatusColor(selectedOrder.status)} border text-sm px-3`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </Badge>
                )}
                <div className="text-xl font-bold text-white">
                  {selectedOrder?.total_price ? `$${Number(selectedOrder.total_price).toFixed(2)}` : 'N/A'}
                </div>
              </div>
            </div>
          </DialogHeader>

          <Separator className="bg-gray-800" />

          <ScrollArea className="flex-1 p-6 max-h-[calc(90vh-140px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Basic Info */}
              <div className="space-y-6">
                <section>
                  <h4 className="flex items-center gap-2 text-primary font-semibold mb-3">
                    <Info className="w-4 h-4" /> Basic Information
                  </h4>
                  <div className="space-y-3 bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                    <div className="grid grid-cols-3 text-sm">
                      <span className="text-gray-500">Presenting:</span>
                      <span className="col-span-2 text-gray-200">{selectedOrder?.presenting}</span>
                    </div>
                    <div className="grid grid-cols-3 text-sm">
                      <span className="text-gray-500">Event Date:</span>
                      <span className="col-span-2 text-gray-200">{selectedOrder && formatDate(selectedOrder.event_date)}</span>
                    </div>
                    <div className="grid grid-cols-3 text-sm">
                      <span className="text-gray-500">Delivery Time:</span>
                      <span className="col-span-2 text-gray-200">{selectedOrder?.delivery_time}</span>
                    </div>
                    <div className="grid grid-cols-3 text-sm">
                      <span className="text-gray-500">Address/Phone:</span>
                      <span className="col-span-2 text-gray-200">{selectedOrder?.address_phone}</span>
                    </div>
                    {selectedOrder?.venue_text && (
                      <div className="grid grid-cols-3 text-sm">
                        <span className="text-gray-500">Venue Info:</span>
                        <span className="col-span-2 text-gray-200">{selectedOrder.venue_text}</span>
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <h4 className="flex items-center gap-2 text-primary font-semibold mb-3">
                    <FileText className="w-4 h-4" /> Flyer Details
                  </h4>
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 space-y-4">
                    <div>
                      <span className="text-gray-500 text-xs block mb-1">FLYER INFO:</span>
                      <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                        {selectedOrder?.flyer_info || "No additional info provided."}
                      </p>
                    </div>
                    {selectedOrder?.custom_notes && (
                      <div>
                        <span className="text-gray-500 text-xs block mb-1">CUSTOM NOTES:</span>
                        <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                          {selectedOrder.custom_notes}
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <h4 className="flex items-center gap-2 text-primary font-semibold mb-3">
                    <Package className="w-4 h-4" /> Selected Extras
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder?.story_size_version && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Story Size Version</Badge>
                    )}
                    {selectedOrder?.custom_flyer && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Custom Flyer</Badge>
                    )}
                    {selectedOrder?.animated_flyer && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Animated Flyer</Badge>
                    )}
                    {selectedOrder?.instagram_post_size && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Instagram Post Size</Badge>
                    )}
                    {!selectedOrder?.story_size_version && !selectedOrder?.custom_flyer && 
                     !selectedOrder?.animated_flyer && !selectedOrder?.instagram_post_size && (
                      <span className="text-sm text-gray-500">No extras selected</span>
                    )}
                  </div>
                </section>
              </div>

              {/* Right Column: People & Images */}
              <div className="space-y-6">
                {/* DJs Section */}
                {selectedOrder?.djs && selectedOrder.djs.length > 0 && (
                  <section>
                    <h4 className="flex items-center gap-2 text-primary font-semibold mb-3">
                      <Users className="w-4 h-4" /> DJs / Artists
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedOrder.djs.map((dj, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-gray-900/50 p-2 rounded-md border border-gray-800">
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-800 shrink-0 border border-gray-700">
                            {getImageUrl(dj.image_url || dj.image) ? (
                              <img src={getImageUrl(dj.image_url || dj.image)!} alt={dj.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600">
                                <User className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-medium truncate">{dj.name || "Unnamed"}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Host Section */}
                {selectedOrder?.host && (selectedOrder.host.name || selectedOrder.host.image) && (
                  <section>
                    <h4 className="flex items-center gap-2 text-primary font-semibold mb-3">
                      <User className="w-4 h-4" /> Host
                    </h4>
                    <div className="flex items-center gap-3 bg-gray-900/50 p-3 rounded-md border border-gray-800">
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-800 shrink-0 border border-gray-700">
                        {getImageUrl(selectedOrder.host.image_url || selectedOrder.host.image) ? (
                          <img src={getImageUrl(selectedOrder.host.image_url || selectedOrder.host.image)!} alt={selectedOrder.host.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <User className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium">{selectedOrder.host.name || "Unnamed Host"}</span>
                    </div>
                  </section>
                )}

                {/* Sponsors Section */}
                {selectedOrder?.sponsors && selectedOrder.sponsors.length > 0 && selectedOrder.sponsors.some(s => getSponsorName(s) || s.image) && (
                  <section>
                    <h4 className="flex items-center gap-2 text-primary font-semibold mb-3">
                      <ImageIcon className="w-4 h-4" /> Sponsors
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedOrder.sponsors.map((sponsor, idx) => {
                        const sName = getSponsorName(sponsor);
                        if (!sName && !sponsor.image && !sponsor.image_url) return null;
                        return (
                          <div key={idx} className="flex flex-col items-center gap-2 p-2 rounded-md bg-gray-900/50 border border-gray-800">
                            <div className="w-full aspect-square rounded bg-gray-800 overflow-hidden border border-gray-700">
                              {getImageUrl(sponsor.image_url || sponsor.image) ? (
                                <img src={getImageUrl(sponsor.image_url || sponsor.image)!} alt={sName} className="w-full h-full object-contain" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-700 italic text-[10px]">
                                  No Logo
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 truncate w-full text-center">{sName || "Sponsor"}</span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Venue Logo Section */}
                {selectedOrder?.venue_logo && (
                  <section>
                    <h4 className="flex items-center gap-2 text-primary font-semibold mb-3">
                      <MapPin className="w-4 h-4" /> Venue Logo
                    </h4>
                    <div className="w-32 aspect-[3/2] rounded-md overflow-hidden bg-gray-900 p-2 border border-gray-800">
                      <img 
                        src={getImageUrl(selectedOrder.venue_logo)!} 
                        alt="Venue Logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </section>
                )}

                {/* Main Flyer Preview */}
                <section>
                  <h4 className="flex items-center gap-2 text-primary font-semibold mb-3">
                    <ImageIcon className="w-4 h-4" /> Flyer Preview
                  </h4>
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border-2 border-primary/20 shadow-2xl shadow-black">
                    <img 
                      src={getImageUrl(selectedOrder?.image_url || (selectedOrder?.flyer_is ? flyerMap[String(selectedOrder.flyer_is)] : null) || selectedOrder?.venue_logo)!} 
                      alt="Full Flyer Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </section>
              </div>
            </div>
            {/* Bottom spacing */}
            <div className="h-8" />
          </ScrollArea>

          <Separator className="bg-gray-800" />
          <div className="p-4 flex justify-end gap-3 bg-gray-950">
             <Button 
               variant="outline" 
               className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
               onClick={() => setIsDetailsOpen(false)}
             >
               Close
             </Button>
             <Button className="bg-primary hover:bg-red-600 text-white font-bold px-8">
               Reorder
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
})

export default OrdersPage
