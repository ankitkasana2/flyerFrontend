"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { observer } from "mobx-react-lite"
import { useStore } from "@/stores/StoreProvider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  DollarSign, 
  Package, 
  User, 
  Users, 
  Image as ImageIcon, 
  MapPin, 
  FileText, 
  Info,
  Download,
  ExternalLink
} from "lucide-react"
import { getApiUrl } from "@/config/api"
import { toast } from "sonner"

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

const OrderDetailsPage = observer(() => {
  const { id } = useParams()
  const { authStore } = useStore()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [flyerMap, setFlyerMap] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchFlyers()
    fetchOrderDetails()
  }, [id])

  const fetchFlyers = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/flyers`)
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

  const fetchOrderDetails = async () => {
    setLoading(true)
    try {
      // Trying to fetch single order. If it fails, we might need to fetch all and filter
      // (though ideally there's a single order endpoint)
      const response = await fetch(`${getApiUrl()}/api/orders/${id}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setOrder(data.order)
        } else {
          // Fallback: fetch all user orders and find this one
          await fetchFromUserOrders()
        }
      } else {
        await fetchFromUserOrders()
      }
    } catch (error) {
      console.error('❌ Error fetching order details:', error)
      await fetchFromUserOrders()
    } finally {
      setLoading(false)
    }
  }

  const fetchFromUserOrders = async () => {
    if (!authStore.user?.id) return
    try {
      const response = await fetch(`${getApiUrl()}/api/orders/user/${authStore.user.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const foundOrder = data.orders.find((o: Order) => String(o.id) === String(id))
          if (foundOrder) {
            setOrder(foundOrder)
          } else {
            toast.error("Order not found")
          }
        }
      }
    } catch (err) {
      console.error('❌ Error in fallback fetch:', err)
    }
  }



  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return null
    if (url.startsWith('http') || url.startsWith('data:')) return url
    return `${getApiUrl()}${url.startsWith('/') ? '' : '/'}${url}`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
      case 'processing':
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
      case 'cancelled':
      case 'canceled':
        return 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-6 text-gray-400 animate-pulse font-medium tracking-wide">Loading your flyer details...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
        <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 text-center max-w-md w-full">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-gray-400 mb-6">We couldn't find the order you're looking for. It might have been deleted or moved.</p>
          <Button onClick={() => router.push('/orders')} className="w-full bg-primary hover:bg-red-600 transition-all duration-300">
            Back to My Orders
          </Button>
        </div>
      </div>
    )
  }

  const mainFlyerImage = getImageUrl(order.image_url || (order.flyer_is ? flyerMap[String(order.flyer_is)] : null) || (order.flyer_id ? flyerMap[String(order.flyer_id)] : null) || order.venue_logo)

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Header / Nav */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <button 
            onClick={() => router.push('/orders')}
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Back to Orders</span>
          </button>
          

        </div>
      </header>

      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Image Preview */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28 lg:h-fit animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-gray-900">
                {mainFlyerImage ? (
                  <img 
                    src={mainFlyerImage} 
                    alt={order.event_title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                    <ImageIcon className="w-20 h-20 opacity-20" />
                    <p>No preview available</p>
                  </div>
                )}
                
                {/* Image Actions Overlay */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button className="p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/20 hover:bg-black/80 transition-all">
                    <Download className="w-5 h-5 text-white" />
                  </button>
                  <button className="p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/20 hover:bg-black/80 transition-all">
                    <ExternalLink className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Quick Status Card */}
            <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl">
               <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm">Order Status</span>
                  <Badge className={`${getStatusColor(order.status)} border px-3 py-1 text-xs uppercase tracking-wider font-bold`}>
                    {order.status}
                  </Badge>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Total Paid</span>
                  <span className="text-3xl font-black text-white bg-clip-text">
                    {order.total_price ? `$${Number(order.total_price).toFixed(2)}` : 'N/A'}
                  </span>
               </div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            
            {/* Hero Info */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="font-mono text-xs px-2 py-1 rounded bg-primary/20 text-primary border border-primary/30">
                  ORDER #{order.id}
                </span>
                <span className="text-gray-700">•</span>
                <span className="text-sm text-gray-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" /> Ordered on {formatDate(order.created_at)}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 tracking-tight leading-tight bg-gradient-to-br from-white via-white to-white/60 bg-clip-text text-transparent">
                {order.event_title}
              </h1>
              <p className="text-base md:text-lg text-gray-400 font-medium max-w-2xl">
                Presented by <span className="text-white border-b border-primary/40 pb-0.5">{order.presenting}</span>
              </p>
            </div>

            <Separator className="bg-white/5" />

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Basic Info */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                  <div className="w-6 h-[1px] bg-primary" /> 
                  <Info className="w-4 h-4" /> Event Logistics
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <DetailItem icon={<Calendar className="w-4 h-4" />} label="Event Date" value={formatDate(order.event_date)} />
                  <DetailItem icon={<Clock className="w-4 h-4" />} label="Delivery Target" value={order.delivery_time} />
                  <DetailItem icon={<MapPin className="w-4 h-4" />} label="Location / Contact" value={order.address_phone} />
                  {order.venue_text && (
                    <DetailItem icon={<MapPin className="w-4 h-4" />} label="Venue Information" value={order.venue_text} />
                  )}
                </div>
              </section>

              {/* Flyer Specs */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                  <div className="w-6 h-[1px] bg-primary" /> 
                  <Package className="w-4 h-4" /> Selected Styles & Extras
                </div>
                <div className="flex flex-wrap gap-3">
                  <ExtraBadge active={order.story_size_version} label="Story Size Version" />
                  <ExtraBadge active={order.custom_flyer} label="Full Custom Flyer" />
                  <ExtraBadge active={order.animated_flyer} label="Motion / Animated" />
                  <ExtraBadge active={order.instagram_post_size} label="Instagram Post Size" />
                  {!order.story_size_version && !order.custom_flyer && !order.animated_flyer && !order.instagram_post_size && (
                    <p className="text-gray-500 italic text-sm">Standard package selected</p>
                  )}
                </div>
              </section>

              {/* Flyer Information Section (Full Width in grid) */}
              <section className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                  <div className="w-6 h-[1px] bg-primary" /> 
                  <FileText className="w-4 h-4" /> Flyer Copy & Content
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-tighter">Information provided:</h4>
                  <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans leading-relaxed">
                    {order.flyer_info || "No additional info provided."}
                  </pre>
                  
                  {order.custom_notes && (
                    <>
                      <div className="h-px bg-white/5 my-4" />
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-tighter">Your custom notes:</h4>
                      <p className="text-sm text-gray-200">
                        {order.custom_notes}
                      </p>
                    </>
                  )}
                </div>
              </section>

              {/* Talent & Artists */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                  <div className="w-6 h-[1px] bg-primary" /> 
                  <Users className="w-4 h-4" /> Djs & Featured Talent
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {order.djs && order.djs.length > 0 ? order.djs.map((dj, idx) => (
                    <TalentCard key={idx} name={dj.name} image={getImageUrl(dj.image_url || dj.image)} />
                  )) : <p className="text-gray-500 text-sm">None listed</p>}
                </div>
              </section>

              {/* Hosting */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                  <div className="w-6 h-[1px] bg-primary" /> 
                  <User className="w-4 h-4" /> Host Presence
                </div>
                {order.host && (order.host.name || order.host.image || order.host.image_url) ? (
                  <TalentCard name={order.host.name || "Main Host"} image={getImageUrl(order.host.image_url || order.host.image)} large />
                ) : <p className="text-gray-500 text-sm">None listed</p>}
              </section>

              {/* Sponsors & Venue */}
              {(order.sponsors?.length > 0 || order.venue_logo) && (
                <section className="md:col-span-2 space-y-4">
                  <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                    <div className="w-6 h-[1px] bg-primary" /> 
                    <ImageIcon className="w-4 h-4" /> Branding & Logos
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {order.venue_logo && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-gray-500 uppercase font-black text-center">Venue</span>
                        <div className="aspect-square rounded-xl bg-white p-2 flex items-center justify-center overflow-hidden grayscale hover:grayscale-0 transition-all duration-500">
                          <img src={getImageUrl(order.venue_logo)!} alt="Venue" className="max-w-full max-h-full object-contain" />
                        </div>
                      </div>
                    )}
                    {order.sponsors?.map((s, idx) => {
                      const name = getSponsorName(s)
                      return (
                        <div key={idx} className="flex flex-col gap-2">
                          <span className="text-[10px] text-gray-500 uppercase font-black text-center truncate">{name || 'Sponsor'}</span>
                          <div className="aspect-square rounded-xl bg-white/10 border border-white/5 p-2 flex items-center justify-center overflow-hidden hover:bg-white/20 transition-all duration-500">
                            {getImageUrl(s.image_url || s.image) ? (
                              <img src={getImageUrl(s.image_url || s.image)!} alt={name} className="max-w-full max-h-full object-contain" />
                            ) : (
                              <span className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">Text Promo</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}
            </div>



          </div>
        </div>
      </main>
      
      {/* Footer spacer */}
      <div className="h-24" />
    </div>
  )
})

// Sub-components for better organization

const DetailItem = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors">
    <div className="mt-1 p-2 rounded-lg bg-primary/10 text-primary">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      <span className="text-sm text-gray-200 font-medium">{value}</span>
    </div>
  </div>
)

const ExtraBadge = ({ active, label }: { active?: boolean, label: string }) => (
  <Badge 
    variant="outline" 
    className={`px-4 py-2 text-xs font-bold transition-all duration-300 ${
      active 
      ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(239,68,68,0.3)]" 
      : "bg-white/5 text-gray-500 border-white/10 opacity-50 select-none line-through"
    }`}
  >
    {label}
  </Badge>
)

const TalentCard = ({ name, image, large }: { name: string, image?: string | null, large?: boolean }) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/20 transition-all group ${large ? 'p-4' : ''}`}>
    <div className={`${large ? 'w-14 h-14' : 'w-10 h-10'} rounded-lg overflow-hidden bg-gray-800 shrink-0 border border-white/10 group-hover:scale-105 transition-transform`}>
      {image ? (
        <img src={image} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-600">
          <User className={large ? 'w-7 h-7' : 'w-5 h-5'} />
        </div>
      )}
    </div>
    <div className="flex flex-col min-w-0">
      <span className={`${large ? 'text-base' : 'text-xs'} font-bold text-white truncate`}>{name || "Unnamed"}</span>
      {large && <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Main Host</span>}
    </div>
  </div>
)

export default OrderDetailsPage
