"use client"

import { Suspense, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { RecentOrders } from "../../components/overview/recent-orders"
import { StatsCards } from "../../components/overview/stats-cards"
import { QuickActions } from "../../components/overview/quick-actions"
import { observer } from "mobx-react-lite"
import { useStore } from "@/stores/StoreProvider"
import { getApiUrl } from "@/config/api"
import { useRouter } from "next/navigation"

const OverviewPage = observer(() => {
  const { authStore, loadingStore } = useStore()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authStore.user?.id) {
      fetchOrders()
    } else if (!authStore.loading) {
      setIsLoading(false)
    }
  }, [authStore.user?.id, authStore.loading])

  const fetchOrders = async () => {
    if (!authStore.user?.id) return

    setIsLoading(true)
    try {
      const response = await fetch(getApiUrl(`/orders/user/${authStore.user.id}`))
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Map backend orders to overview expectations
          const mappedOrders = data.orders.map((o: any) => {
            const fileUrl = o.image_url || o.venue_logo || ""
            const fullUrl = (fileUrl && !fileUrl.startsWith('http') && !fileUrl.startsWith('data:'))
              ? `${getApiUrl().replace(/\/$/, '')}/${fileUrl.replace(/^\//, '')}`
              : fileUrl || "/placeholder.svg"

            return {
              id: String(o.id),
              title: o.event_title || "Untitled Flyer",
              status: o.status.toLowerCase(),
              image: fullUrl
            }
          })
          setOrders(mappedOrders)
        }
      }
    } catch (error) {
      console.error("Error fetching orders for overview:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (authStore.loading || isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!authStore.user) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-bold">Please sign in to view your overview</h1>
        <p className="text-muted-foreground">You need to be logged in to see your recent activity.</p>
        <button
          onClick={() => authStore.handleAuthModal()}
          className="rounded-full bg-primary px-6 py-2 front-semibold"
        >
          Sign In
        </button>
      </div>
    )
  }

  const totalPurchased = orders.length

  return (
    <main className="min-h-screen">
      {/* Hero header */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-10 md:pt-14">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h1 className={cn("text-pretty text-3xl font-semibold tracking-tight md:text-4xl")}>Overview</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              A quick snapshot of your recent activity and essentials.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Suspense>
              <RecentOrders orders={orders} />
            </Suspense>
          </div>
          <div className="md:col-span-1">
            <StatsCards totalPurchased={totalPurchased} />
            <div className="mt-6">
              <QuickActions />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
})

export default OverviewPage
