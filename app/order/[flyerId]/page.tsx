"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { OrderForm } from "@/components/order/order-form"
import { observer } from "mobx-react-lite"
import { useStore } from "@/stores/StoreProvider"
import { useToast } from "@/hooks/use-toast"

const OrderPage = () => {
  const params = useParams()
  const router = useRouter()
  const { authStore, flyerFormStore } = useStore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const flyerId = params.flyerId as string
  const user = authStore.user

  useEffect(() => {
    if (flyerId) {
      flyerFormStore.fetchFlyer(flyerId)
    }
  }, [flyerId, flyerFormStore])

  const selectedFlyer = flyerFormStore.flyer

  if (flyerFormStore.loading) {
     return (
        <div className="min-h-screen bg-background flex items-center justify-center">
             <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
     )
  }

  if (!selectedFlyer) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Flyer not found</h1>
          <p className="text-muted-foreground">The flyer you're looking for doesn't exist.</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Please sign in to place an order</h1>
        </div>
        <Footer />
      </div>
    )
  }

  const handleOrderSubmit = async (orderData: any) => {
    setIsSubmitting(true)
    try {
      // Mock order creation - replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const orderId = `ORD-${Date.now()}`

      toast({
        title: "Order created!",
        description: "Redirecting to checkout...",
      })

      router.push(`/checkout/${orderId}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Place Your Order</h1>
          <p className="text-muted-foreground">Fill out the details for your custom flyer</p>
        </div>

        <OrderForm 
           selectedFlyer={selectedFlyer as any} 
           onCancel={handleCancel} 
        />
      </main>

      <Footer />
    </div>
  )
}

export default observer(OrderPage)
