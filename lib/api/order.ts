import { OrderSubmission } from '@/types/order';
import { getApiUrl } from '@/config/api';

export function buildOrderFormData(submission: OrderSubmission): FormData {
  const { formData, files } = submission;
  const formDataObj = new FormData();


  // Required fields based on working Postman code
  formDataObj.append('presenting', formData.presenting || '')
  formDataObj.append('event_title', formData.event_title || '')
  formDataObj.append('event_date', formData.event_date || '')
  formDataObj.append('flyer_info', formData.flyer_info || '')
  formDataObj.append('address_phone', formData.address_phone || '')
  formDataObj.append('story_size_version', String(formData.story_size_version || false))
  formDataObj.append('custom_flyer', String(formData.custom_flyer || false))
  formDataObj.append('animated_flyer', String(formData.animated_flyer || false))
  formDataObj.append('instagram_post_size', String(formData.instagram_post_size || true))
  formDataObj.append('custom_notes', formData.custom_notes || '')
  formDataObj.append('flyer_is', String(formData.flyer_is || 26))
  formDataObj.append('category_id', String(formData.category_id || 9))
  formDataObj.append('user_id', formData.user_id || '99ae0488-f0a1-70db-db50-da298fdef51esery')
  formDataObj.append('delivery_time', formData.delivery_time || '1 Hour')
  formDataObj.append('total_price', String(formData.total_price || 10))
  formDataObj.append('subtotal', String(formData.subtotal || 10))
  formDataObj.append('image_url', formData.image_url || 'https://images.unsplash.com/photo.jpg')
  formDataObj.append('email', formData.email || 'user@example.com') // Use real email from form
  formDataObj.append('web_user_id', '')

  // Add duplicate total_price with space (as seen in Postman)
  formDataObj.append(' total_price', String(formData.total_price || 78))

  // JSON fields
  formDataObj.append('djs', JSON.stringify(formData.djs || []))

  formDataObj.append('host', JSON.stringify(formData.host || {}))

  formDataObj.append('sponsors', JSON.stringify(formData.sponsors || []))

  // Append files
  if (files.venueLogoFile) {
    formDataObj.append('venue_logo', files.venueLogoFile);
  }
  if (files.hostFile) {
    formDataObj.append('host_file', files.hostFile);
  }

  // Append DJ files
  files.djFiles.forEach((file, index) => {
    formDataObj.append(`dj_${index}`, file);
  });

  // Append sponsor files
  files.sponsorFiles.forEach((file, index) => {
    formDataObj.append(`sponsor_${index}`, file);
  });

  return formDataObj;
}

export async function submitOrder(
  orderSubmission: OrderSubmission
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const formData = buildOrderFormData(orderSubmission)


    const response = await fetch(getApiUrl('/api/orders'), {
      method: 'POST',
      body: formData,
      // Note: Don't set Content-Type header - let the browser set it with the correct boundary
    })


    const responseData = await response.json()

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to submit order')
    }

    return { success: true, data: responseData }
  } catch (error) {
    console.error('Order submission error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
