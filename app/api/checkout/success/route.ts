import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

const BACKEND_API_URL = "http://193.203.161.174:3007";

export async function GET(request: NextRequest) {
  try {
    // Determine the base URL dynamically to avoid 0.0.0.0 issues
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl || baseUrl.includes('0.0.0.0')) {
      const host = request.headers.get('host')
      const protocol = request.headers.get('x-forwarded-proto') || 'http'
      if (host && !host.includes('0.0.0.0')) {
        baseUrl = `${protocol}://${host}`
      } else {
        baseUrl = 'http://localhost:3000'
      }
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      console.error('❌ No session_id in request')
      return NextResponse.redirect(
        new URL('/success?error=missing_session_id', baseUrl)
      )
    }

    // Retrieve the session to verify payment
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId)
    } catch (stripeError: any) {
      console.error('❌ Stripe session retrieval error:', stripeError);
      return NextResponse.redirect(
        new URL(`/success?session_id=${sessionId}&error=${encodeURIComponent('Stripe error: ' + stripeError.message)}`, baseUrl)
      )
    }

    if (!session) {
      console.error('❌ Session not found:', sessionId)
      return NextResponse.redirect(
        new URL('/success?error=session_not_found', baseUrl)
      )
    }

    if (session.payment_status !== 'paid') {
      console.error('❌ Payment not successful for session:', sessionId)
      return NextResponse.redirect(
        new URL(`/success?session_id=${sessionId}&error=payment_failed`, baseUrl)
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
        new URL(`/success?session_id=${sessionId}&error=${encodeURIComponent('Order data not found in metadata')}`, baseUrl)
      )
    }


    // Decode order data from base64
    let orderData
    try {
      const orderDataString = Buffer.from(orderDataBase64, 'base64').toString('utf-8')
      orderData = JSON.parse(orderDataString)
      console.log('✅ Decoded order data for:', orderData.userEmail)
    } catch (decodeError: any) {
      console.error('❌ Error decoding order data:', decodeError)
      return NextResponse.redirect(
        new URL(`/success?session_id=${sessionId}&error=${encodeURIComponent('Failed to decode order data: ' + decodeError.message)}`, baseUrl)
      )
    }

    // Extract items to process (could be a single item or multiple from cart)
    const itemsToProcess = orderData.items || [orderData.formData || orderData];
    const createdOrderIds: string[] = [];
    const allTempFilesToCleanup: string[] = [];

    console.log(`📦 Processing ${itemsToProcess.length} order(s) from cart`);

    // Loop through each item and create a separate order
    for (let index = 0; index < itemsToProcess.length; index++) {
      const formDataObj = itemsToProcess[index];

      // Create FormData for THIS specific item
      const formData = new FormData();

      // Add all fields from the actual order data
      formData.append('presenting', formDataObj.presenting || '');
      formData.append('event_title', formDataObj.event_title || '');

      let formattedDate = formDataObj.event_date || '';
      if (formattedDate && formattedDate.includes('T')) {
        formattedDate = formattedDate.split('T')[0];
      }
      formData.append('event_date', formattedDate);
      formData.append('flyer_info', formDataObj.flyer_info || '');
      formData.append('address_phone', formDataObj.address_phone || '');
      formData.append('story_size_version', (formDataObj.story_size_version || false).toString());
      formData.append('custom_flyer', (formDataObj.custom_flyer || false).toString());
      formData.append('animated_flyer', (formDataObj.animated_flyer || false).toString());
      formData.append('instagram_post_size', (formDataObj.instagram_post_size || true).toString());
      formData.append('delivery_time', formDataObj.delivery_time || '24 hours');
      formData.append('custom_notes', formDataObj.custom_notes || '');

      const flyerId = formDataObj.flyer_id || formDataObj.flyer_is || 1;
      formData.append('flyer_is', flyerId.toString());
      formData.append('category_id', (formDataObj.category_id || 1).toString());
      formData.append('user_id', formDataObj.user_id || orderData.userId || '');
      formData.append('web_user_id', formDataObj.user_id || orderData.userId || '');
      formData.append('email', formDataObj.email || orderData.userEmail || 'user@example.com');

      const parsePrice = (p: any) => {
        if (typeof p === 'number') return p;
        if (typeof p === 'string') return parseFloat(p.replace(/[^0-9.]/g, '')) || 0;
        return 0;
      };
      const cleanPrice = parsePrice(formDataObj.total_price || 0);

      formData.append('total_price', cleanPrice.toString());
      formData.append(' total_price', cleanPrice.toString());
      formData.append('subtotal', parsePrice(formDataObj.subtotal || 0).toString());
      formData.append('image_url', formDataObj.image_url || '');

      // Sanitize JSON fields
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

      formData.append('djs', JSON.stringify(djsSanitized));
      const hostPayload = hostsSanitized.length > 0 ? hostsSanitized[0] : { name: '' };
      formData.append('host', JSON.stringify(hostPayload));
      formData.append('sponsors', JSON.stringify(sponsorsSanitized));

      formData.append('venue_text', formDataObj.venue_text || '');
      const venueLogo = formDataObj.venue_logo_url || formDataObj.venue_logo || '';
      formData.append('venue_logo_url', venueLogo);
      if (venueLogo && typeof venueLogo === 'string' && venueLogo.startsWith('http')) {
        formData.append('venue_logo', venueLogo);
      }

      // Handle TEMP FILES upload for this item
      const tempFilesToCleanup: string[] = [];
      if (formDataObj.temp_files) {
        try {
          const { readFile } = await import('fs/promises');
          const { existsSync } = await import('fs');

          for (const [fieldName, filepath] of Object.entries(formDataObj.temp_files as Record<string, string>)) {
            if (filepath && existsSync(filepath)) {
              try {
                const buffer = await readFile(filepath);
                const ext = filepath.split('.').pop()?.toLowerCase();
                let mimeType = 'application/octet-stream';
                if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
                else if (ext === 'png') mimeType = 'image/png';
                else if (ext === 'webp') mimeType = 'image/webp';

                const blob = new Blob([buffer], { type: mimeType });

                let backendFieldName = fieldName;
                if (fieldName.startsWith('host_')) {
                  const hostIndex = parseInt(fieldName.split('_')[1]);
                  backendFieldName = hostIndex === 0 ? 'host_file' : `host_file_${hostIndex}`;
                }

                formData.append(backendFieldName, blob as any, filepath.split(/[\\\/]/).pop());
                tempFilesToCleanup.push(filepath);
              } catch (err) {
                console.error(`❌ Failed to read temp file ${filepath}:`, err);
              }
            }
          }
        } catch (importErr) {
          console.error('❌ Error importing FS tools:', importErr);
        }
      }

      // Submit THIS order to backend API
      try {
        console.log(`🚀 Submitting order ${index + 1} to backend...`);
        const response = await fetch(`${BACKEND_API_URL}/api/orders`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Backend API error for item ${index + 1}:`, errorText);
          continue;
        }

        const responseData = await response.json();
        const orderId = responseData.order?.id || responseData.orderId || responseData.id;

        if (orderId) {
          createdOrderIds.push(orderId.toString());
          allTempFilesToCleanup.push(...tempFilesToCleanup);

          // Send confirmation email
          console.log(`📧 ========== ATTEMPTING TO SEND CONFIRMATION EMAIL ==========`);
          console.log(`📧 Order ID: ${orderId}`);
          console.log(`📧 Customer Email: ${formDataObj.email || orderData.userEmail}`);

          try {
            console.log(`📧 Importing email module...`);
            const { sendOrderConfirmationEmail } = await import('@/lib/email');
            console.log(`📧 Email module imported successfully`);
            console.log(`📧 sendOrderConfirmationEmail type:`, typeof sendOrderConfirmationEmail);

            const emailParams = {
              orderId: orderId.toString(),
              customerName: formDataObj.email ? formDataObj.email.split('@')[0] : "Valued Customer",
              customerEmail: formDataObj.email || orderData.userEmail,
              flyerName: formDataObj.event_title || `Flyer Order #${orderId}`,
              details: {
                price: Number(formDataObj.total_price),
                extras: [],
                deliveryTime: formDataObj.delivery_time
              },
              totalPrice: Number(formDataObj.total_price),
              imageUrl: formDataObj.image_url
            };

            console.log(`📧 Email params:`, JSON.stringify(emailParams, null, 2));
            console.log(`📧 Calling sendOrderConfirmationEmail...`);

            const emailResult = await sendOrderConfirmationEmail(emailParams);

            console.log(`📧 ✅ Email sent successfully! MessageId:`, emailResult?.MessageId);
          } catch (emailError: any) {
            console.error('📧 ⚠️ Failed to send confirmation email:', emailError);
            console.error('📧 Error details:', {
              message: emailError.message,
              code: emailError.code,
              stack: emailError.stack
            });
          }
        }
      } catch (fetchError) {
        console.error(`❌ Error submitting order ${index + 1}:`, fetchError);
      }
    }

    if (createdOrderIds.length === 0) {
      return NextResponse.redirect(
        new URL(`/success?session_id=${sessionId}&order_created=false&error=${encodeURIComponent('No orders were created on backend')}`, baseUrl)
      );
    }

    // ✅ CLEANUP TEMP FILES
    try {
      if (allTempFilesToCleanup.length > 0) {
        const { unlink, rmdir } = await import('fs/promises');
        const { dirname } = await import('path');
        for (const filepath of allTempFilesToCleanup) {
          try { await unlink(filepath); } catch (err) { }
        }
        try {
          const uploadDir = dirname(allTempFilesToCleanup[0]);
          await rmdir(uploadDir);
        } catch (err) { }
      }
    } catch (cleanupErr) { }

    // Clear cart
    if (session.metadata?.source === 'cart' && orderData.userId) {
      try {
        await fetch(`${BACKEND_API_URL}/api/cart/clear/${orderData.userId}`, { method: 'DELETE' });
      } catch (cartError) { }
    }

    // Success redirect
    return NextResponse.redirect(
      new URL(`/thank-you?orderId=${createdOrderIds.join(',')}&session_id=${sessionId}&order_created=true`, baseUrl)
    )

  } catch (error: any) {
    console.error('❌ Checkout success handler error:', error)

    // Resolve baseUrl again for the catch block
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    if (baseUrl.includes('0.0.0.0')) {
      const host = request.headers.get('host')
      if (host && !host.includes('0.0.0.0')) {
        baseUrl = `http://${host}`
      }
    }

    return NextResponse.redirect(
      new URL(`/success?order_created=false&error=${encodeURIComponent(error.message || 'Processing error')}`, baseUrl)
    )
  }
}
