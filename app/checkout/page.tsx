"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { OrderForm } from '@/components/order/order-form'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/stores/StoreProvider'

const CheckoutPage = () => {
  const searchParams = useSearchParams()
  const { flyerFormStore } = useStore()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const flyerId = searchParams.get('flyerId')
    
    if (flyerId) {
      setLoading(true)
      flyerFormStore.fetchFlyer(flyerId).then(() => {
        if (!flyerFormStore.flyer) {
          setError('Flyer not found')
        }
        setLoading(false)
      }).catch(err => {
        setError('Failed to load flyer data')
        setLoading(false)
      })
    } else {
      // If no flyerId, maybe it's a cart checkout?
      // For now, let's keep the existing logic or handle cart
      setError('No flyer selected for direct purchase')
      setLoading(false)
    }

    const errorParam = searchParams.get('error')
    const messageParam = searchParams.get('message')
    if (errorParam) {
      setError(messageParam || 'An error occurred during checkout')
    }
  }, [searchParams, flyerFormStore])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Checkout Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!flyerFormStore.flyer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Checkout Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Flyer not found'}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <OrderForm
          selectedFlyer={flyerFormStore.flyer as any}
          onCancel={() => window.history.back()}
        />
      </div>
    </div>
  )
}

export default observer(CheckoutPage)
