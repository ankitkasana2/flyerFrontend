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

  // Scroll to top when flyer ID changes
  useEffect(() => {
    // Show loading state to indicate page change
    setIsNavigating(true)

    // Scroll to top immediately
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Fetch new flyer data
    flyerFormStore.fetchFlyer(FlyerId as string).finally(() => {
      // Clear loading state after data is fetched
      setTimeout(() => setIsNavigating(false), 300)
    })
  }, [FlyerId, flyerFormStore])

  // alert(JSON.stringify(flyerFormStore));


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
      <EventBookingForm />
    </main>
  )
}


export default observer(FlyerPage);