'use client'

import EventBookingForm from "@/components/orer-form/flyer-form"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { observer } from "mobx-react-lite"
import { useStore } from "@/stores/StoreProvider"
import { toJS } from "mobx"



const FlyerPage = () => {
  const { authStore, filterBarStore, flyerFormStore } = useStore()
  const { FlyerId } = useParams()
  const [isNavigating, setIsNavigating] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Scroll to top when flyer ID changes
  useEffect(() => {
    // Show loading state to indicate page change
    setIsNavigating(true)

    // Scroll to top instantly for immediate visual feedback
    window.scrollTo({ top: 0, behavior: 'auto' })

    // Fetch new flyer data
    flyerFormStore.fetchFlyer(FlyerId as string).finally(() => {
      // Clear loading state after data is fetched
      setTimeout(() => setIsNavigating(false), 500)
    })
  }, [FlyerId, flyerFormStore])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!authStore.isLoggedIn && !authStore.loading) {
        authStore.handleAuthModal()
      }
      setIsCheckingAuth(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [authStore.isLoggedIn, authStore.loading])

  if (isCheckingAuth || authStore.loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!authStore.isLoggedIn) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Registration Required</h1>
        <p className="text-gray-400 mb-8 max-w-md"> Please sign in or create an account to view flyer details and start your design. </p>
        <button
          onClick={() => authStore.handleAuthModal()}
          className="px-8 py-3 bg-primary text-white font-bold rounded-full hover:scale-105 transition-transform"
        >
          Sign In / Register
        </button>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black">
      {isNavigating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="text-white text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-lg font-medium">Loading flyer...</p>
          </div>
        </div>
      )}
      {/* Key prop forces complete remount when FlyerId changes */}
      <EventBookingForm key={FlyerId as string} />
    </main>
  )
}


export default observer(FlyerPage);