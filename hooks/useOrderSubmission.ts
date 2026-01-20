import { useState } from 'react';
import { OrderSubmission } from '@/types/order';
import { submitOrder } from '@/lib/api/order';
import { useRouter } from 'next/navigation';

export function useOrderSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmitOrder = async (orderSubmission: OrderSubmission) => {
    setIsSubmitting(true)
    setError(null)

    try {
      
      const result = await submitOrder(orderSubmission)
      

      if (result.success) {
        // Redirect to success page with order ID if available
        const orderId = result.data?.orderId || result.data?.id || result.data?._id
        router.push(`/thank-you${orderId ? `?orderId=${orderId}` : ''}`)
        return { success: true, data: result.data }
      } else {
        console.error('Order submission failed:', result.error)
        throw new Error(result.error || 'Failed to submit order')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      console.error('Order submission failed:', err)
      return { success: false, error: errorMessage }
    } finally {
      setIsSubmitting(false)
    }
  };

  return { handleSubmitOrder, isSubmitting, error };
}

export default useOrderSubmission;
