import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

const BACKEND_API_URL = "http://193.203.161.174:3007";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      console.error('❌ No session_id in request')
      return NextResponse.redirect(
        new URL('/success?error=missing_session_id', request.url)
      )
    }


    // Retrieve the session to verify payment
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      console.error('❌ Session not found:', sessionId)
      return NextResponse.redirect(
        new URL('/success?error=session_not_found', request.url)
      )
    }

    if (session.payment_status !== 'paid') {
      console.error('❌ Payment not successful for session:', sessionId)
      return NextResponse.redirect(
        new URL('/success?error=payment_failed', request.url)
      )
    }


    // Get order data from Stripe metadata
    console.log('🔍 Stripe metadata received:', session.metadata)
    let orderDataBase64 = session.metadata?.orderData
    const chunkCount = session.metadata?.chunkCount

    // Check if data was chunked
    if (chunkCount) {
      const chunks = []
      for (let i = 0; i < parseInt(chunkCount); i++) {
        const chunk = session.metadata?.[`orderData_${i}`]
        if (chunk) {
          chunks.push(chunk)
        }
      }
      orderDataBase64 = chunks.join('')
    }

    if (!orderDataBase64) {
      console.error('❌ No order data found in session metadata')
      return NextResponse.redirect(
        new URL(`/success?session_id=${sessionId}&error=${encodeURIComponent('Order data not found')}`, request.url)
      )
    }


    // Decode order data from base64
    let orderData
    try {
      const orderDataString = Buffer.from(orderDataBase64, 'base64').toString('utf-8')
      orderData = JSON.parse(orderDataString)
      console.log('✅ Decoded order data for:', orderData.userEmail)
    } catch (decodeError) {
      console.error('❌ Error decoding order data:', decodeError)
      return NextResponse.redirect(
        new URL(`/success?session_id=${sessionId}&error=${encodeURIComponent('Failed to decode order data')}`, request.url)
      )
    }

    // Extract form data from the retrieved order data
    const formDataObj = orderData.formData || orderData


    // Create FormData for the backend API with REAL data
    // Create FormData for the backend API with REAL data
    const formData = new FormData()

    // Add all fields from the actual order data
    formData.append('presenting', formDataObj.presenting || '')
    formData.append('event_title', formDataObj.event_title || '')
    
    // Format date specifically for backend (YYYY-MM-DD)
    let formattedDate = formDataObj.event_date || '';
    if (formattedDate && formattedDate.includes('T')) {
      formattedDate = formattedDate.split('T')[0];
    }
    formData.append('event_date', formattedDate)
    formData.append('flyer_info', formDataObj.flyer_info || '')
    formData.append('address_phone', formDataObj.address_phone || '')
    formData.append('story_size_version', (formDataObj.story_size_version || false).toString())
    formData.append('custom_flyer', (formDataObj.custom_flyer || false).toString())
    formData.append('animated_flyer', (formDataObj.animated_flyer || false).toString())
    formData.append('instagram_post_size', (formDataObj.instagram_post_size || true).toString())
    formData.append('delivery_time', formDataObj.delivery_time || '24 hours')
    formData.append('custom_notes', formDataObj.custom_notes || '')

    // Log the flyer_id being used
    const flyerId = formDataObj.flyer_id || formDataObj.flyer_is || 1;

    formData.append('flyer_is', flyerId.toString())
    formData.append('category_id', (formDataObj.category_id || 1).toString())
    formData.append('user_id', formDataObj.user_id || orderData.userId || '')
    formData.append('web_user_id', formDataObj.user_id || orderData.userId || '')
    formData.append('email', formDataObj.email || orderData.userEmail || 'user@example.com')
    const parsePrice = (p: any) => {
      if (typeof p === 'number') return p;
      if (typeof p === 'string') return parseFloat(p.replace(/[^0-9.]/g, '')) || 0;
      return 0;
    };
    const cleanPrice = parsePrice(formDataObj.total_price || 0);

    formData.append('total_price', cleanPrice.toString())
    formData.append(' total_price', cleanPrice.toString()) // Extra space for backend compatibility
    formData.append('subtotal', parsePrice(formDataObj.subtotal || 0).toString())
    formData.append('image_url', formDataObj.image_url || '')

    // 🔍 DEBUG: Log what we're about to send

    // Add JSON fields with actual data
    // Add JSON fields with actual data - Sanitize to only send names (stripping temp image_urls) to match backend expectation
    // But PRESERVE image_url if it is an external URL (from media library)
    const sanitizeItem = (item: any) => {
      const result: any = { name: item.name || '' };
      const img = item.image_url || item.image;
      if (img && typeof img === 'string' && img.startsWith('http')) {
        result.image_url = img;
      }
      return result;
    };

    const djsSanitized = Array.isArray(formDataObj.djs) ? formDataObj.djs.map(sanitizeItem) : (formDataObj.djs ? [sanitizeItem(formDataObj.djs)] : []);
    const hostsSanitized = Array.isArray(formDataObj.host) ? formDataObj.host.map(sanitizeItem) : (formDataObj.host ? [sanitizeItem(formDataObj.host)] : []);
    const sponsorsSanitized = Array.isArray(formDataObj.sponsors) ? formDataObj.sponsors.map(sanitizeItem) : (formDataObj.sponsors ? [sanitizeItem(formDataObj.sponsors)] : []);

    formData.append('djs', JSON.stringify(djsSanitized))

    // FIX: Backend expects 'host' as a SINGLE object, not an array (based on Postman code)
    const hostPayload = hostsSanitized.length > 0 ? hostsSanitized[0] : { name: '' };
    formData.append('host', JSON.stringify(hostPayload)) 
    
    formData.append('sponsors', JSON.stringify(sponsorsSanitized))


    // Add venue_text if present
    formData.append('venue_text', formDataObj.venue_text || '')
    const venueLogo = formDataObj.venue_logo_url || formDataObj.venue_logo || '';
    formData.append('venue_logo_url', venueLogo)
    // Also send as 'venue_logo' for backend compatibility when it's a URL
    if (venueLogo && typeof venueLogo === 'string' && venueLogo.startsWith('http')) {
      formData.append('venue_logo', venueLogo)
    }

    // Handle TEMP FILES upload (Server-Side File Reading)
    // If we have temp_files mapping, read them and append as Files efficiently
    const tempFilesToCleanup: string[] = [];
    
    if (formDataObj.temp_files) {
      const { readFile } = await import('fs/promises');
      const { existsSync } = await import('fs');

      for (const [fieldName, filepath] of Object.entries(formDataObj.temp_files as Record<string, string>)) {
        if (filepath && existsSync(filepath)) {
           try {
              const buffer = await readFile(filepath);
              // Determine MIME type
              const ext = filepath.split('.').pop()?.toLowerCase();
              let mimeType = 'application/octet-stream';
              if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
              else if (ext === 'png') mimeType = 'image/png';
              else if (ext === 'webp') mimeType = 'image/webp';
              
              const blob = new Blob([buffer], { type: mimeType }); // Fetch formData needs Blob with type
              
              // Map field names to what backend expects
              let backendFieldName = fieldName;
              
              // Host mapping: host_0 → host_file, host_1 → host_file_1
              if (fieldName.startsWith('host_')) {
                const hostIndex = parseInt(fieldName.split('_')[1]);
                if (hostIndex === 0) {
                  backendFieldName = 'host_file';
                } else {
                  backendFieldName = `host_file_${hostIndex}`;
                }
              }
              // Sponsor mapping: sponsor_0 → sponsor_0, sponsor_1 → sponsor_1
              else if (fieldName.startsWith('sponsor_')) {
                // Keep the original field name (sponsor_0, sponsor_1, etc.) as it matches cart.ts
                backendFieldName = fieldName;
              }
              // DJ and venue_logo stay as is: dj_0, dj_1, venue_logo
              
              formData.append(backendFieldName, blob as any, filepath.split(/[\\\/]/).pop());
              
              // Track for cleanup after successful submission
              tempFilesToCleanup.push(filepath);
           } catch(err) {
              console.error(`❌ Failed to read temp file ${filepath}:`, err);
           }
        } else {
           console.warn(`⚠️ Temp file not found: ${filepath}`);
        }
      }
    }

    console.log('✅ Prepared FormData for backend upload')

    // 🔍 DEBUG: Log all FormData keys AND values
    for (const [key, value] of formData.entries()) {
      if (key === 'host' || key === 'sponsors' || key === 'djs') {
      } else if (key.startsWith('host_') || key.startsWith('sponsor_') || key.startsWith('dj_')) {
      }
    }

    // Submit to backend API - THIS IS THE ONLY PLACE WHERE ORDER IS CREATED
    const response = await fetch(`${BACKEND_API_URL}/api/orders`, {
      method: 'POST',
      body: formData
    })


    if (!response.ok) {
      const errorText = await response.text()
      try {
        const errorJson = JSON.parse(errorText)
        console.error('❌ Backend API error JSON:', errorJson)
      } catch (e) {
        console.error('❌ Backend API error text:', errorText)
      }
      
      console.log('🔍 Payload sent to backend:', Object.fromEntries(formData.entries()))

      return NextResponse.redirect(
        new URL(`/success?session_id=${sessionId}&order_created=false&error=${encodeURIComponent('Backend creation failed')}`, request.url)
      )
    }

    const responseData = await response.json()

    // ✅ CLEANUP TEMP FILES AFTER SUCCESSFUL ORDER CREATION
    if (tempFilesToCleanup.length > 0) {
      const { unlink, rmdir } = await import('fs/promises');
      const { dirname } = await import('path');
      
      for (const filepath of tempFilesToCleanup) {
        try {
          await unlink(filepath);
        } catch (err) {
          console.warn(`⚠️ Could not delete temp file ${filepath}:`, err);
        }
      }
      
      // Try to delete the upload directory if it's empty
      if (tempFilesToCleanup.length > 0) {
        try {
          const uploadDir = dirname(tempFilesToCleanup[0]);
          await rmdir(uploadDir);
        } catch (err) {
          // Directory not empty or other error - this is fine
        }
      }
    }

    // Get order ID from response
    const orderId = responseData.orderId || responseData.id || responseData._id

    // Send confirmation email
    try {
      // Dynamically import the email function to avoid top-level import issues if not used elsewhere
      const { sendOrderConfirmationEmail } = await import('@/lib/email');
      
      const extras = [];
      if (formDataObj.story_size_version) extras.push("Story Size Version");
      if (formDataObj.custom_flyer) extras.push("Custom Flyer Design");
      if (formDataObj.animated_flyer) extras.push("Animated Flyer");
      
      
      await sendOrderConfirmationEmail({
        orderId: orderId.toString(),
        customerName: formDataObj.email ? formDataObj.email.split('@')[0] : "Valued Customer",
        customerEmail: formDataObj.email || orderData.userEmail,
        flyerName: formDataObj.event_title || `Flyer Order #${orderId}`,
        details: {
          price: Number(formDataObj.total_price),
          extras: extras,
          deliveryTime: formDataObj.delivery_time
        },
        totalPrice: Number(formDataObj.total_price),
        imageUrl: formDataObj.image_url
      });
    } catch (emailError) {
      console.error('⚠️ Failed to send confirmation email:', emailError);
      // We continue to redirect even if email fails
    }

    // Clear cart if this was a cart checkout
    if (session.metadata?.source === 'cart' && orderData.userId) {
      try {
        const clearCartRes = await fetch(`${BACKEND_API_URL}/api/cart/clear/${orderData.userId}`, {
          method: 'DELETE'
        });
        if (clearCartRes.ok) {
           console.log(`✅ Cart successfully cleared on backend for user: ${orderData.userId}`);
        } else {
           console.warn(`⚠️ Backend failed to clear cart for user: ${orderData.userId}`);
        }
      } catch (cartError) {
        console.error('⚠️ Error calling backend to clear cart:', cartError);
      }
    }

    // Redirect to thank you page with order ID and session ID
    return NextResponse.redirect(
      new URL(`/thank-you?orderId=${orderId || ''}&session_id=${sessionId}&order_created=true`, request.url)
    )

  } catch (error) {
    console.error('❌ Checkout success handler error:', error)
    return NextResponse.redirect(
      new URL(`/success?order_created=false&error=${encodeURIComponent('Processing error')}`, request.url)
    )
  }
}
