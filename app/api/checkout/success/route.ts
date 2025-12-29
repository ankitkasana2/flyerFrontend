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
        new URL('/checkout?error=missing_session_id', request.url)
      )
    }

    console.log('🔍 Processing success for session:', sessionId)

    // Retrieve the session to verify payment
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      console.error('❌ Session not found:', sessionId)
      return NextResponse.redirect(
        new URL('/checkout?error=session_not_found', request.url)
      )
    }

    if (session.payment_status !== 'paid') {
      console.error('❌ Payment not successful for session:', sessionId)
      return NextResponse.redirect(
        new URL('/checkout?error=payment_failed', request.url)
      )
    }

    console.log('✅ Payment verified successfully!')

    // Get order data from Stripe metadata
    let orderDataBase64 = session.metadata?.orderData
    const chunkCount = session.metadata?.chunkCount

    // Check if data was chunked
    if (chunkCount) {
      console.log(`📦 Reassembling ${chunkCount} chunks...`)
      const chunks = []
      for (let i = 0; i < parseInt(chunkCount); i++) {
        const chunk = session.metadata?.[`orderData_${i}`]
        if (chunk) {
          chunks.push(chunk)
        }
      }
      orderDataBase64 = chunks.join('')
      console.log('✅ Chunks reassembled, total size:', orderDataBase64.length, 'bytes')
    }

    if (!orderDataBase64) {
      console.error('❌ No order data found in session metadata')
      return NextResponse.redirect(
        new URL(`/success?session_id=${sessionId}&error=${encodeURIComponent('Order data not found')}`, request.url)
      )
    }

    console.log('📦 Decoding order data from metadata...')

    // Decode order data from base64
    let orderData
    try {
      const orderDataString = Buffer.from(orderDataBase64, 'base64').toString('utf-8')
      orderData = JSON.parse(orderDataString)

      console.log('✅ Order data decoded successfully:', {
        userId: orderData.userId,
        presenting: orderData.formData?.presenting,
        total_price: orderData.formData?.total_price
      })
    } catch (decodeError) {
      console.error('❌ Error decoding order data:', decodeError)
      return NextResponse.redirect(
        new URL(`/success?session_id=${sessionId}&error=${encodeURIComponent('Failed to decode order data')}`, request.url)
      )
    }

    // Extract form data from the retrieved order data
    const formDataObj = orderData.formData || orderData

    console.log('🚀 Creating REAL order with actual form data...')

    // Create FormData for the backend API with REAL data
    // Create FormData for the backend API with REAL data
    const formData = new FormData()

    // Add all fields from the actual order data
    formData.append('presenting', formDataObj.presenting || '')
    formData.append('event_title', formDataObj.event_title || '')
    formData.append('event_date', formDataObj.event_date || '')
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
    console.log('🎯 Using flyer_id:', flyerId, '(from flyer_id:', formDataObj.flyer_id, ', flyer_is:', formDataObj.flyer_is, ')');

    formData.append('flyer_is', flyerId.toString())
    formData.append('category_id', (formDataObj.category_id || 1).toString())
    formData.append('user_id', formDataObj.user_id || orderData.userId || '')
    formData.append('web_user_id', formDataObj.user_id || orderData.userId || '')
    formData.append('email', formDataObj.email || orderData.userEmail || 'user@example.com')
    formData.append('total_price', (formDataObj.total_price || 0).toString())
    formData.append('subtotal', (formDataObj.subtotal || 0).toString())
    formData.append('image_url', formDataObj.image_url || '')

    // 🔍 DEBUG: Log what we're about to send
    console.log('🔍 DEBUG - formDataObj.host:', formDataObj.host);
    console.log('🔍 DEBUG - formDataObj.sponsors:', formDataObj.sponsors);
    console.log('🔍 DEBUG - formDataObj.djs:', formDataObj.djs);

    // Add JSON fields with actual data
    formData.append('djs', JSON.stringify(formDataObj.djs || []))
    formData.append('host', JSON.stringify(formDataObj.host || []))  // Should be array, not object
    formData.append('sponsors', JSON.stringify(formDataObj.sponsors || []))

    console.log('🔍 DEBUG - JSON stringified host:', JSON.stringify(formDataObj.host || []));
    console.log('🔍 DEBUG - JSON stringified sponsors:', JSON.stringify(formDataObj.sponsors || []));

    // Add venue_text if present
    formData.append('venue_text', formDataObj.venue_text || '')
    formData.append('venue_logo_url', formDataObj.venue_logo_url || '')

    // Handle TEMP FILES upload (Server-Side File Reading)
    // If we have temp_files mapping, read them and append as Files efficiently
    const tempFilesToCleanup: string[] = [];
    
    if (formDataObj.temp_files) {
      console.log('📂 Processing temp files:', Object.keys(formDataObj.temp_files));
      const { readFile } = await import('fs/promises');
      const { existsSync } = await import('fs');

      for (const [fieldName, filepath] of Object.entries(formDataObj.temp_files as Record<string, string>)) {
        if (filepath && existsSync(filepath)) {
           try {
              const buffer = await readFile(filepath);
              const blob = new Blob([buffer]); // Fetch formData needs Blob
              
              // Map field names to what backend expects
              let backendFieldName = fieldName;
              
              // Host mapping: host_0 → host, host_1 → host_1, host_2 → host_2
              if (fieldName === 'host_0') {
                backendFieldName = 'host';
              }
              // Sponsor mapping: sponsor_0 → sponsor_sponsor1, sponsor_1 → sponsor_sponsor2, etc.
              else if (fieldName.startsWith('sponsor_')) {
                const sponsorIndex = parseInt(fieldName.split('_')[1]);
                backendFieldName = `sponsor_sponsor${sponsorIndex + 1}`;
              }
              // DJ and venue_logo stay as is: dj_0, dj_1, venue_logo
              
              formData.append(backendFieldName, blob as any, filepath.split(/[\\\/]/).pop());
              console.log(`✅ Attached file ${fieldName} → ${backendFieldName} from ${filepath}`);
              
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

    console.log('📤 Submitting REAL order to backend API...')
    console.log('📋 Order details:', {
      presenting: formDataObj.presenting,
      event_title: formDataObj.event_title,
      total_price: formDataObj.total_price,
      user_id: formDataObj.user_id,
      host_count: (formDataObj.host || []).length,
      dj_count: (formDataObj.djs || []).length,
      temp_files_count: tempFilesToCleanup.length
    })

    // 🔍 DEBUG: Log all FormData keys AND values
    console.log('🔍 DEBUG - FormData contents:');
    for (const [key, value] of formData.entries()) {
      if (key === 'host' || key === 'sponsors' || key === 'djs') {
        console.log(`  - ${key}: ${typeof value === 'string' ? value : '[File]'}`);
      } else if (key.startsWith('host_') || key.startsWith('sponsor_') || key.startsWith('dj_')) {
        console.log(`  - ${key}: [File - ${value instanceof Blob ? (value as any).name || 'unnamed' : 'not a blob'}]`);
      }
    }

    // Submit to backend API - THIS IS THE ONLY PLACE WHERE ORDER IS CREATED
    const response = await fetch(`${BACKEND_API_URL}/api/orders`, {
      method: 'POST',
      body: formData
    })

    console.log('📬 Backend API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Backend API error:', errorText)

      return NextResponse.redirect(
        new URL(`/success?session_id=${sessionId}&order_created=false&error=${encodeURIComponent('Failed to create order')}`, request.url)
      )
    }

    const responseData = await response.json()
    console.log('🎉 Order created successfully:', responseData)

    // ✅ CLEANUP TEMP FILES AFTER SUCCESSFUL ORDER CREATION
    if (tempFilesToCleanup.length > 0) {
      console.log('🧹 Cleaning up temp files...');
      const { unlink, rmdir } = await import('fs/promises');
      const { dirname } = await import('path');
      
      for (const filepath of tempFilesToCleanup) {
        try {
          await unlink(filepath);
          console.log(`✅ Deleted temp file: ${filepath}`);
        } catch (err) {
          console.warn(`⚠️ Could not delete temp file ${filepath}:`, err);
        }
      }
      
      // Try to delete the upload directory if it's empty
      if (tempFilesToCleanup.length > 0) {
        try {
          const uploadDir = dirname(tempFilesToCleanup[0]);
          await rmdir(uploadDir);
          console.log(`✅ Deleted empty temp directory: ${uploadDir}`);
        } catch (err) {
          // Directory not empty or other error - this is fine
          console.log('ℹ️ Temp directory not deleted (may contain other files)');
        }
      }
    }

    // Get order ID from response
    const orderId = responseData.orderId || responseData.id || responseData._id
    console.log('📋 Order ID:', orderId)

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
