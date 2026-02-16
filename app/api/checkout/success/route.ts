import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { API_BASE_URL, getApiUrl } from '@/config/api'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

const BACKEND_API_URL = API_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    // Determine the base URL dynamically, prioritizing the current host header
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    let baseUrl = (host && !host.includes('0.0.0.0'))
      ? `${protocol}://${host}`
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // Safety check for invalid baseUrl
    if (baseUrl.includes('0.0.0.0')) {
      baseUrl = 'http://localhost:3000'
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.redirect(
        new URL('/success?error=missing_session_id', baseUrl)
      )
    }

    // Retrieve the session to verify payment
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId)
    } catch (stripeError: any) {
      return NextResponse.redirect(
        new URL(`/success?session_id=${sessionId}&error=${encodeURIComponent('Stripe error: ' + stripeError.message)}`, baseUrl)
      )
    }

    if (!session) {
      return NextResponse.redirect(
        new URL('/success?error=session_not_found', baseUrl)
      )
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.redirect(
        new URL(`/success?session_id=${sessionId}&error=payment_failed`, baseUrl)
      )
    }


    // Get order data from Stripe metadata
    let orderDataBase64 = session.metadata?.orderData
    const chunkCount = session.metadata?.chunkCount

    // Check if data was chunked
    if (chunkCount) {
      const chunks = []
      const count = parseInt(chunkCount)
      for (let i = 0; i < count; i++) {
        const chunk = session.metadata?.[`orderData_${i}`]
        if (chunk) {
          chunks.push(chunk)
        }
      }
      orderDataBase64 = chunks.join('')
    }

    if (!orderDataBase64) {
      return NextResponse.redirect(
        new URL(`/success?session_id=${sessionId}&error=${encodeURIComponent('Order data not found in metadata')}`, baseUrl)
      )
    }


    // Decode order data from base64
    let orderData: any
    try {
      const orderDataString = Buffer.from(orderDataBase64, 'base64').toString('utf-8')
      console.log("📦 DECODED ORDER DATA:", orderDataString.substring(0, 200) + "...");
      orderData = JSON.parse(orderDataString)
    } catch (decodeError: any) {
      console.error("❌ DECODE ERROR:", decodeError);
      return NextResponse.redirect(
        new URL(`/success?session_id=${sessionId}&error=${encodeURIComponent('Failed to decode order data: ' + decodeError.message)}`, baseUrl)
      )
    }

    // Extract items to process (could be a single item or multiple from cart)
    // Robust extraction: check for items array first, then formData, then the object itself
    let itemsToProcess: any[] = []
    if (orderData.items && Array.isArray(orderData.items)) {
      itemsToProcess = orderData.items
    } else if (orderData.formData) {
      itemsToProcess = [orderData.formData]
    } else {
      // Fallback: check if the object itself looks like order data
      itemsToProcess = [orderData]
    }

    console.log(`🛒 Processing ${itemsToProcess.length} items`);

    const createdOrderIds: string[] = [];
    const allTempFilesToCleanup: string[] = [];
    let lastBackendError = "";

    if (itemsToProcess.length === 0) {
      lastBackendError = "No items to process in order data";
    }

    // Loop through each item and create a separate order
    for (let index = 0; index < itemsToProcess.length; index++) {
      const formDataObj = itemsToProcess[index];
      console.log(`📝 Processing item ${index + 1}/${itemsToProcess.length}:`, formDataObj.event_title);

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
      formData.append('story_size_version', (formDataObj.story_size_version ?? false).toString());
      formData.append('custom_flyer', (formDataObj.custom_flyer ?? false).toString());
      formData.append('animated_flyer', (formDataObj.animated_flyer ?? false).toString());
      formData.append('instagram_post_size', (formDataObj.instagram_post_size ?? true).toString());
      formData.append('delivery_time', formDataObj.delivery_time || '24 hours');
      formData.append('custom_notes', formDataObj.custom_notes || '');

      const flyerId = formDataObj.flyer_id || formDataObj.flyer_is || 1;
      formData.append('flyer_is', flyerId.toString());
      formData.append('category_id', (formDataObj.category_id || 1).toString());
      formData.append('user_id', formDataObj.user_id || orderData.userId || '');
      formData.append('web_user_id', formDataObj.web_user_id || ''); // Explicitly prefer web_user_id if present
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
        if (!item) return { name: '' };
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
                // Skip failed file reads
              }
            }
          }
        } catch (importErr) {
          // Handle import errors
        }
      }

      // Submit THIS order to backend API
      try {
        const orderEndpoint = `${BACKEND_API_URL}/api/orders`;
        console.log(`📡 Sending to backend: ${orderEndpoint}`);

        const response = await fetch(orderEndpoint, {
          method: 'POST',
          body: formData
        });

        console.log(`📶 Backend response status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Backend error text:`, errorText);
          lastBackendError = `Backend ${response.status}: ${errorText.substring(0, 100)}`;
          continue;
        }

        const responseData = await response.json();
        console.log(`✅ Backend response data:`, responseData);

        // Handle cases where backend returns 200 but success is false
        if (responseData.success === false) {
          lastBackendError = `Backend logic error: ${responseData.message || JSON.stringify(responseData)}`;
          continue;
        }

        // Broaden order ID extraction to handle various backend response formats
        const orderId =
          responseData.order?.id ||
          responseData.orderId ||
          responseData.id ||
          responseData.data?.id ||
          responseData.data?.order?.id ||
          responseData.order_id ||
          (responseData.success && !isNaN(Number(responseData.data)) ? responseData.data : null);

        if (orderId) {
          console.log(`🎉 Order created successfully! ID: ${orderId}`);
          createdOrderIds.push(orderId.toString());
          allTempFilesToCleanup.push(...tempFilesToCleanup);

          try {
            const { sendOrderConfirmationEmail } = await import('@/lib/email');
            await sendOrderConfirmationEmail({
              orderId: orderId.toString(),
              customerName: formDataObj.name || (formDataObj.email ? formDataObj.email.split('@')[0] : "Valued Customer"),
              customerEmail: formDataObj.email || orderData.userEmail,
              flyerName: formDataObj.event_title || `Flyer Order #${orderId}`,
              details: {
                price: Number(formDataObj.total_price),
                extras: [],
                deliveryTime: formDataObj.delivery_time
              },
              totalPrice: Number(formDataObj.total_price),
              imageUrl: formDataObj.image_url
            });
          } catch (emailError: any) {
            // Non-blocking email error
          }
        } else {
          lastBackendError = `Order created but no ID found in response: ${JSON.stringify(responseData).substring(0, 100)}`;
        }
      } catch (fetchError: any) {
        lastBackendError = `Fetch error: ${fetchError.message}`;
      }
    }

    if (createdOrderIds.length === 0) {
      const diagInfo = `items=${itemsToProcess.length}, keys=${Object.keys(orderData).join('|').substring(0, 50)}`;
      const errorMsg = lastBackendError || `No orders were created on backend (${diagInfo})`;
      return NextResponse.redirect(
        new URL(`/success?session_id=${sessionId}&order_created=false&error=${encodeURIComponent(errorMsg)}`, baseUrl)
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
          // Attempt to remove the parent directory if empty
          const uploadDir = dirname(allTempFilesToCleanup[0]);
          await rmdir(uploadDir);
        } catch (err) { }
      }
    } catch (cleanupErr) { }

    // Clear cart (best effort)
    if ((session.metadata?.source === 'cart' || orderData.userId) && orderData.userId) {
      try {
        await fetch(getApiUrl(`/cart/clear/${orderData.userId}`), { method: 'DELETE' });
      } catch (cartError) { }
    }

    // Success redirect
    return NextResponse.redirect(
      new URL(`/thank-you?orderId=${createdOrderIds.join(',')}&session_id=${sessionId}&order_created=true`, baseUrl)
    )

  } catch (error: any) {
    // Resolve baseUrl again for the catch block
    let errUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    try {
      const host = request.headers.get('host')
      const protocol = request.headers.get('x-forwarded-proto') || 'http'
      errUrl = host ? `${protocol}://${host}` : errUrl
    } catch (e) { }

    return NextResponse.redirect(
      new URL(`/success?order_created=false&error=${encodeURIComponent(error.message || 'Processing error')}`, errUrl)
    );
  }
}
