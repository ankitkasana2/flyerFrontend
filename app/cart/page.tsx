"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { observer } from "mobx-react-lite";
import { useStore } from "@/stores/StoreProvider";
import { getApiUrl } from "@/config/api"
import { toast } from "sonner"

function currency(n?: number | string) {
    if (!n) return "$0.00"
    const num = typeof n === 'string' ? parseFloat(n) : n
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num)
}

function getImageUrl(url: string | null | undefined) {
    if (!url) return null
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/')) return url
    // If it's a relative path and doesn't start with /, it's likely a backend path
    return `${getApiUrl()}/${url}`
}

const CartPage = observer(() => {
    const { authStore, cartStore } = useStore()
    const [isCheckingOut, setIsCheckingOut] = useState(false)

    const handleCheckout = async () => {
        console.log("🛒 ~ handleCheckout started")
        if (!authStore.user) {
            authStore.handleAuthModal()
            return
        }

        if (cartStore.cartItems.length === 0) return

        setIsCheckingOut(true)
        try {
            // Map cart items to the format expected by the checkout session API
            const items = cartStore.cartItems.map(item => ({
                ...item,
                image_url: getImageUrl(item.image_url || item.flyer?.image || item.venue_logo),
                user_id: authStore.user?.id,
                email: item.email || authStore.user?.email,
                flyer_id: item.flyer_is,
                address_phone: item.address_and_phone, // Map for backend compatibility
                subtotal: item.total_price,
                eventDetails: {
                    mainTitle: item.event_title,
                    presenting: item.presenting
                }
            }))

            console.log("🚀 ~ Proceeding to checkout with items ->", items)

            const response = await fetch('/api/checkout/session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ item: items }),
            })

            const data = await response.json()
            console.log("📦 ~ Checkout Session Response ->", data)

            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error(data.error || 'Failed to create checkout session')
            }
        } catch (err: any) {
            console.error('Checkout error:', err)
            toast.error(err.message || 'An error occurred during checkout')
        } finally {
            setIsCheckingOut(false)
        }
    }

    // Load cart on mount
    useEffect(() => {
        if (authStore.user?.id) {
            cartStore.load(authStore.user.id)
        }
    }, [authStore.user?.id])

    if (cartStore.isLoading) {
        return (
            <div className="container mx-auto py-20 text-center">
                <p>Loading your cart...</p>
            </div>
        )
    }

    const cartItems = cartStore.cartItems
    const subtotal = cartStore.totalPrice
    const fees = Math.round(subtotal * 0.05 * 100) / 100
    const total = subtotal + fees

    const EmptyState = () => (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center">
                <span className="text-2xl"><ShoppingBag className="h-6 w-6" /></span>
            </div>
            <h2 className="text-xl font-semibold text-balance">Your cart is empty</h2>
            <p className="text-muted-foreground mt-2">Browse our flyer catalog and add templates to your cart.</p>
            <div className="mt-6 flex items-center justify-center gap-3">
                <Link href="/categories">
                    <Button variant="default" className="text-primary-foreground hover:cursor-pointer">
                        Browse Flyers
                    </Button>
                </Link>
                <Link href="/favorites">
                    <Button variant="outline" className="hover:cursor-pointer">View Favorites</Button>
                </Link>
            </div>
        </div>
    )

    return (
        <main className="container mx-auto px-4 py-6 md:py-10">
            <header className="mb-6 md:mb-10">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-balance">Your Cart</h1>
                <p className="text-muted-foreground mt-1">Review your flyer templates and proceed to secure checkout.</p>
            </header>

            {cartItems.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Items */}
                    <section className="lg:col-span-2 rounded-lg border border-border bg-card p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Items ({cartItems.length})</h2>
                            <Button
                                variant="ghost"
                                className="text-primary"
                                onClick={() => authStore.user?.id && cartStore.clearCart(authStore.user.id)}
                            >
                                Clear cart
                            </Button>
                        </div>

                        <ul className="mt-4 space-y-4">
                            {cartItems.map((item) => (
                                <li key={item.id} className="rounded-md border border-border p-4 overflow-hidden">
                                    <div className="flex items-start gap-4">
                                        <div className="h-70 w-50 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                                            <img
                                                src={
                                                    getImageUrl(item.flyer?.image || item.image_url || item.venue_logo) ||
                                                    "/placeholder.svg"
                                                }
                                                alt={item.flyer?.title || item.event_title || "Flyer thumbnail"}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-start gap-2">
                                                <h3 className="font-medium truncate">{item.event_title || "Untitled Flyer"}</h3>
                                                <Badge>{item.status || 'active'}</Badge>
                                            </div>

                                            {item.flyer && (
                                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        Template: {item.flyer.title}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.flyer.type}
                                                    </Badge>
                                                </div>
                                            )}

                                            <div className="mt-2 text-sm text-muted-foreground">
                                                <p><strong>Presenting:</strong> {item.presenting}</p>
                                                <p><strong>Date:</strong> {new Date(item.event_date).toLocaleDateString()}</p>
                                                <p><strong>Delivery:</strong> {item.delivery_time}</p>
                                                <p><strong>Address:</strong> {item.address_and_phone}</p>
                                            </div>

                                            {item.flyer_info && (
                                                <div className="mt-2 text-sm text-muted-foreground">
                                                    <p><strong>Info:</strong> {item.flyer_info}</p>
                                                </div>
                                            )}

                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <span className="text-base font-semibold">{currency(item.total_price)}</span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => authStore.user?.id && cartStore.removeFromCart(item.id, authStore.user.id)}
                                                    className="gap-2"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Remove
                                                </Button>
                                                <Link href={`/order/${item.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        Edit
                                                    </Button>
                                                </Link>
                                            </div>

                                            {/* Show options */}
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {item.story_size_version && <Badge variant="secondary">Story Size</Badge>}
                                                {item.custom_flyer && <Badge variant="secondary">Custom</Badge>}
                                                {item.animated_flyer && <Badge variant="secondary">Animated</Badge>}
                                                {item.instagram_post_size && <Badge variant="secondary">Instagram Post</Badge>}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                            <Link href="/categories">
                                <Button variant="outline">Continue Shopping</Button>
                            </Link>
                            <Button 
                                className="bg-primary text-primary-foreground"
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                            >
                                {isCheckingOut ? "Processing..." : "Checkout"}
                            </Button>
                        </div>
                    </section>

                    {/* Right: Summary */}
                    <aside className="rounded-lg border border-border bg-card p-4 md:p-6 h-fit">
                        <h2 className="text-lg font-semibold">Order Summary</h2>
                        <div className="mt-4 space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">{currency(subtotal)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Service fees</span>
                                <span className="font-medium">{currency(fees)}</span>
                            </div>
                            <div className="border-t border-border pt-3 flex items-center justify-between">
                                <span className="font-semibold">Total</span>
                                <span className="font-semibold">{currency(total)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Delivery options and upgrades (Story size, Animation, Rush) are selected on the order form after
                                checkout.
                            </p>
                        </div>

                        <Button 
                            className="mt-5 w-full bg-primary text-primary-foreground"
                            onClick={handleCheckout}
                            disabled={isCheckingOut}
                        >
                            {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
                        </Button>

                        <div className="mt-4">
                            <h3 className="text-sm font-medium">What's included</h3>
                            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                <li>• Instagram Post size</li>
                                <li>• Professional PSD editing by our team</li>
                                <li>• Delivery via Email, SMS, and Profile</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            )}
        </main>
    )
})

export default CartPage
