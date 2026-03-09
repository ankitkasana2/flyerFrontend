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
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    let baseUrl = (host && !host.includes('0.0.0.0'))
      ? `${protocol}://${host}`
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    if (baseUrl.includes('0.0.0.0')) {
      baseUrl = 'http://localhost:3000'
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.redirect(new URL('/success?error=missing_session_id', baseUrl))
    }

    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId)
    } catch (stripeError: any) {
      return NextResponse.redirect(
        new URL(`/success?session_id=${sessionId}&error=${encodeURIComponent('Stripe error: ' + stripeError.message)}`, baseUrl)
      )
    }

    if (!session) {
      return NextResponse.redirect(new URL('/success?error=session_not_found', baseUrl))
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.redirect(
        new URL(`/success?session_id=${sessionId}&error=payment_failed`, baseUrl)
      )
    }

    let orderDataBase64 = session.metadata?.orderData
    const chunkCount = session.metadata?.chunkCount

    if (chunkCount) {
      const chunks = []
      const count = parseInt(chunkCount)
      for (let i = 0; i < count; i++) {
        const chunk = session.metadata?.[`orderData_${i}`]
        if (chunk) chunks.push(chunk)
      }
      orderDataBase64 = chunks.join('')
    }

    if (!orderDataBase64) {
      return NextResponse.redirect(
        new URL(`/success?session_id=${sessionId}&error=${encodeURIComponent('Order data not found in metadata')}`, baseUrl)
      )
    }

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

    let itemsToProcess: any[] = []
    if (orderData.items && Array.isArray(orderData.items)) {
      itemsToProcess = orderData.items
    } else if (orderData.formData) {
      itemsToProcess = [orderData.formData]
    } else {
      itemsToProcess = [orderData]
    }

    console.log(`🛒 Processing ${itemsToProcess.length} items`);

    // ✅ STEP 1: Declare all variables before loop
    const createdOrderIds: string[] = [];
    const allTempFilesToCleanup: string[] = [];
    let lastBackendError = "";
    const allFlyerInfoForEmail: { orderId: string; flyerName: string; total: string; imageUrl?: string }[] = [];
    const emailToSend = orderData.userEmail || itemsToProcess[0]?.email || '';
    const customerName = itemsToProcess[0]?.presenting || itemsToProcess[0]?.name || emailToSend.split('@')[0] || 'Valued Customer';

    if (itemsToProcess.length === 0) {
      lastBackendError = "No items to process in order data";
    }

    // ✅ STEP 2: Loop — sirf orders create karo, email nahi
    for (let index = 0; index < itemsToProcess.length; index++) {
      const formDataObj = itemsToProcess[index];
      console.log(`📝 Processing item ${index + 1}/${itemsToProcess.length}:`, formDataObj.event_title);

      const formData = new FormData();

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

      const resolvedUserId = formDataObj.web_user_id || formDataObj.user_id || orderData.userId || ''
      formData.append('web_user_id', resolvedUserId)
      formData.append('user_id', resolvedUserId)

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

      const parseMaybeJson = (value: any) => {
        if (typeof value !== 'string') return value;
        const trimmed = value.trim();
        if (!trimmed) return value;
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
          try { return JSON.parse(trimmed); } catch { return value; }
        }
        return value;
      };

      const asArray = (value: any): any[] => {
        if (Array.isArray(value)) return value;
        if (value === null || value === undefined || value === '') return [];
        return [value];
      };

      const isTempUrlStr = (url: string) => url && typeof url === 'string' && url.includes('/api/serve-temp');

      const normalizeMediaUrlForBackend = (url: string) => {
        if (!url || typeof url !== 'string') return '';
        const raw = url.trim();
        if (!raw) return '';
        if (isTempUrlStr(raw)) return raw;
        if (raw.startsWith('/uploads/') || raw.startsWith('/api/uploads/')) return getApiUrl(raw);
        if (raw.startsWith('http://') || raw.startsWith('https://')) {
          try {
            const parsed = new URL(raw);
            if (parsed.pathname.startsWith('/uploads/') || parsed.pathname.startsWith('/api/uploads/')) {
              return getApiUrl(`${parsed.pathname}${parsed.search}`);
            }
          } catch { return raw; }
          return raw;
        }
        if (raw.startsWith('/')) return raw;
        return raw.includes('uploads/') ? getApiUrl(`/${raw.replace(/^\/+/, '')}`) : raw;
      };

      const sanitizeItem = (item: any) => {
        if (!item) return { name: '' };
        if (typeof item === 'string') {
          const raw = item.trim();
          if (!raw) return { name: '' };
          if (raw.startsWith('http') || raw.startsWith('/') || raw.includes('/')) {
            return { name: '', image_url: normalizeMediaUrlForBackend(raw) };
          }
          return { name: raw };
        }
        const result: any = { name: item.name || item.title || '' };
        const img = item.image_url || item.imageUrl || item.image || item.file_url || item.url;
        if (img && typeof img === 'string') result.image_url = normalizeMediaUrlForBackend(img);
        return result;
      };

      const parsedDjs = parseMaybeJson(formDataObj.djs);
      const parsedHosts = parseMaybeJson(formDataObj.host);
      const parsedSponsors = parseMaybeJson(formDataObj.sponsors);

      const djsSanitized = asArray(parsedDjs).map(sanitizeItem);
      const hostsSanitized = asArray(parsedHosts).map(sanitizeItem);
      const sponsorsSanitized = asArray(parsedSponsors).map(sanitizeItem);

      formData.append('djs', JSON.stringify(djsSanitized));
      const hostPayload = hostsSanitized.length > 0 ? hostsSanitized[0] : { name: '' };
      formData.append('host', JSON.stringify(hostPayload));
      formData.append('sponsors', JSON.stringify(sponsorsSanitized));

      for (let i = 0; i < 3; i++) {
        const sponsorUrl = session.metadata?.[`sponsor_url_${i}`] || formDataObj[`sponsor_url_${i}`] || sponsorsSanitized[i]?.image_url || ''
        const normalizedSponsorUrl = normalizeMediaUrlForBackend(sponsorUrl)
        if (normalizedSponsorUrl) formData.append(`sponsor_url_${i}`, normalizedSponsorUrl)
      }

      for (let i = 0; i < 5; i++) {
        const djUrl = session.metadata?.[`dj_url_${i}`] || formDataObj[`dj_url_${i}`] || djsSanitized[i]?.image_url || ''
        const normalizedDjUrl = normalizeMediaUrlForBackend(djUrl)
        if (normalizedDjUrl) formData.append(`dj_url_${i}`, normalizedDjUrl)
      }

      for (let i = 0; i < 2; i++) {
        const hostUrl = session.metadata?.[`host_url_${i}`] || formDataObj[`host_url_${i}`] || hostsSanitized[i]?.image_url || ''
        const normalizedHostUrl = normalizeMediaUrlForBackend(hostUrl)
        if (normalizedHostUrl) formData.append(`host_url_${i}`, normalizedHostUrl)
      }

      const birthdayPersonPhotoUrl = session.metadata?.birthday_person_photo_url || formDataObj.birthday_person_photo_url || ''
      const normalizedBirthdayPhotoUrl = normalizeMediaUrlForBackend(birthdayPersonPhotoUrl)
      if (normalizedBirthdayPhotoUrl) formData.append('birthday_person_photo_url', normalizedBirthdayPhotoUrl)

      formData.append('venue_text', formDataObj.venue_text || '');

      const venueLogo = session.metadata?.venue_logo_url || formDataObj.venue_logo_url || formDataObj.venue_logo || ''
      const normalizedVenueLogo = normalizeMediaUrlForBackend(venueLogo)
      const tempFilesForVenue = (() => {
        const value = formDataObj.temp_files
        if (!value) return null
        if (typeof value === 'string') {
          try { const parsed = JSON.parse(value); return parsed && typeof parsed === 'object' ? parsed : null } catch { return null }
        }
        return typeof value === 'object' ? value : null
      })()
      const venueLogoTempPath = (tempFilesForVenue as Record<string, string> | null)?.venue_logo
      const hasVenueLogoLocalTemp = typeof venueLogoTempPath === 'string' && isTempUrlStr(venueLogoTempPath)
      if (normalizedVenueLogo && !hasVenueLogoLocalTemp) formData.append('venue_logo_url', normalizedVenueLogo)

      const tempFilesToCleanup: string[] = [];
      const parsedTempFiles = (() => {
        const value = formDataObj.temp_files
        if (!value) return null
        if (typeof value === 'string') {
          try { const parsed = JSON.parse(value); return parsed && typeof parsed === 'object' ? parsed : null } catch { return null }
        }
        return (typeof value === 'object') ? value : null
      })()

      if (parsedTempFiles) {
        try {
          const { existsSync } = await import('fs');
          const isHttpUrl = (value: string) => /^https?:\/\//i.test(value);
          const isServeTempUrl = (value: string) => typeof value === 'string' && value.includes('/api/serve-temp');
          const isPermanentUploadUrl = (value: string) => {
            if (!isHttpUrl(value)) return false;
            try {
              const parsed = new URL(value);
              return parsed.pathname.startsWith('/uploads/') || parsed.pathname.startsWith('/api/uploads/');
            } catch { return false; }
          };

          for (const [fieldName, filepath] of Object.entries(parsedTempFiles as Record<string, string>)) {
            if (!filepath) continue;
            let buffer: Buffer | null = null;
            let fileName = filepath.split(/[\\\/]/).pop() || `${fieldName}.jpg`;

            if (isPermanentUploadUrl(filepath)) continue;

            if (isHttpUrl(filepath)) {
              if (isServeTempUrl(filepath)) {
                try {
                  const { tmpdir } = await import('os');
                  const { join } = await import('path');
                  const parsed = new URL(filepath);
                  const queryKey = parsed.searchParams.get('key');
                  const queryPath = parsed.searchParams.get('path');
                  if (queryKey) {
                    const localPath = join(tmpdir(), 'flyer-uploads', queryKey);
                    if (existsSync(localPath)) {
                      const { readFile } = await import('fs/promises');
                      buffer = await readFile(localPath);
                      fileName = queryKey.split(/[\\\/]/).pop() || fileName;
                    }
                  } else if (queryPath && existsSync(queryPath)) {
                    const { readFile } = await import('fs/promises');
                    buffer = await readFile(queryPath);
                    fileName = queryPath.split(/[\\\/]/).pop() || fileName;
                  }
                } catch (err) { }
              }

              if (!buffer) {
                try {
                  const tempResp = await fetch(filepath);
                  if (tempResp.ok) {
                    const arr = await tempResp.arrayBuffer();
                    buffer = Buffer.from(arr);
                    try {
                      const parsed = new URL(filepath);
                      const queryPath = parsed.searchParams.get('path');
                      const queryKey = parsed.searchParams.get('key');
                      if (queryPath) fileName = queryPath.split(/[\\\/]/).pop() || fileName;
                      else if (queryKey) fileName = queryKey.split(/[\\\/]/).pop() || fileName;
                    } catch { }
                  }
                } catch (err) { }
              }
            } else if (existsSync(filepath)) {
              try {
                const { readFile } = await import('fs/promises');
                buffer = await readFile(filepath);
              } catch (err) { buffer = null; }
            }

            if (buffer) {
              try {
                const ext = fileName.split('.').pop()?.toLowerCase();
                let mimeType = 'application/octet-stream';
                if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
                else if (ext === 'png') mimeType = 'image/png';
                else if (ext === 'webp') mimeType = 'image/webp';

                const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
                let backendFieldName = fieldName;
                if (fieldName.startsWith('host_')) {
                  const hostIndex = parseInt(fieldName.split('_')[1]);
                  backendFieldName = hostIndex === 0 ? 'host_file' : `host_file_${hostIndex}`;
                } else if (fieldName === 'birthday_person_photo') {
                  backendFieldName = 'host_file';
                }
                formData.append(backendFieldName, blob as any, fileName);
                if (!isHttpUrl(filepath)) tempFilesToCleanup.push(filepath);
              } catch (err) { }
            }
          }
        } catch (importErr) { }
      }

      // Submit order to backend
      try {
        let orderEndpoint = getApiUrl('/orders');
        if (!orderEndpoint.startsWith('http')) {
          const apiPath = orderEndpoint.startsWith('/') ? orderEndpoint : `/${orderEndpoint}`;
          orderEndpoint = `${baseUrl}${apiPath}`;
        }

        console.log(`📡 Sending to backend: ${orderEndpoint}`);
        const response = await fetch(orderEndpoint, { method: 'POST', body: formData });
        console.log(`📶 Backend response status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          lastBackendError = `Backend ${response.status}: ${errorText.substring(0, 100)}`;
          continue;
        }

        const responseData = await response.json();
        console.log(`✅ Backend response data:`, responseData);

        if (responseData.success === false) {
          lastBackendError = `Backend logic error: ${responseData.message || JSON.stringify(responseData)}`;
          continue;
        }

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
          // ✅ Sirf flyer info store karo — email baad mein bhejenge
          allFlyerInfoForEmail.push({
            orderId: orderId.toString(),
            flyerName: formDataObj.event_title || "Professional Flyer",
            total: formDataObj.total_price?.toString() || "0",
            imageUrl: formDataObj.image_url || '',
          });
        } else {
          lastBackendError = `Order created but no ID found in response: ${JSON.stringify(responseData).substring(0, 100)}`;
        }
      } catch (fetchError: any) {
        lastBackendError = `Fetch error: ${fetchError.message}`;
      }
    }
    // ✅ LOOP KHATAM

    if (createdOrderIds.length === 0) {
      const diagInfo = `items=${itemsToProcess.length}, keys=${Object.keys(orderData).join('|').substring(0, 50)}`;
      const errorMsg = lastBackendError || `No orders were created on backend (${diagInfo})`;
      return NextResponse.redirect(
        new URL(`/success?session_id=${sessionId}&order_created=false&error=${encodeURIComponent(errorMsg)}`, baseUrl)
      );
    }

    // ✅ STEP 3: Cleanup temp files
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

    // ✅ STEP 4: Cart clear
    const userIdToClear = orderData.userId || orderData.formData?.user_id || orderData.formData?.web_user_id || ''
    if (userIdToClear) {
      try {
        console.log(`🗑️ Clearing cart for user: ${userIdToClear}`)
        await fetch(getApiUrl(`/cart/clear/${userIdToClear}`), { method: 'DELETE' });
        console.log(`✅ Cart cleared successfully`)
      } catch (cartError) {
        console.error('❌ Cart clear failed:', cartError)
      }
    }

    // ✅ STEP 5: EK SAATH SAARE FLYERS KI EMAIL BHEJO
    if (createdOrderIds.length > 0 && emailToSend) {
      try {
        const { resend } = await import('@/lib/resend');
        const { OrderConfirmationEmail } = await import('@/emails/OrderConfirmation');
        const { render } = await import('@react-email/render');

        const emailHtml = await render(
          <OrderConfirmationEmail
            name={customerName}
            orderId={createdOrderIds[0]}
            flyerName={allFlyerInfoForEmail[0]?.flyerName || "Professional Flyer"}
            total={allFlyerInfoForEmail[0]?.total || "0"}
            date={new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            imageUrl={allFlyerInfoForEmail[0]?.imageUrl}
            allFlyers={allFlyerInfoForEmail}
          />
        );

        const orderIdsText = createdOrderIds.length > 1
          ? `Orders #${createdOrderIds.join(', #')}`
          : `Order #${createdOrderIds[0]}`;

        await resend.emails.send({
          from: "Grodify <support@mail.grodify.com>",
          to: emailToSend,
          replyTo: "admin@grodify.com",
          subject: `Order Confirmation - ${orderIdsText}`,
          html: emailHtml,
          headers: { 'X-Entity-Ref-ID': createdOrderIds[0] },
        });

        console.log(`📧 Confirmation email sent for ${createdOrderIds.length} order(s)`);

        const { PurchaseReceivingEmail } = await import('@/emails/Purchasereceiving');
        const purchaseHtml = await render(
          <PurchaseReceivingEmail
            name={customerName}
            orderId={createdOrderIds[0]}
            flyerName={allFlyerInfoForEmail[0]?.flyerName || "Professional Flyer"}
            total={allFlyerInfoForEmail.reduce((sum, f) => sum + parseFloat(f.total || '0'), 0).toFixed(2)}
            date={new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          />
        );

        await resend.emails.send({
          from: "Grodify <support@mail.grodify.com>",
          to: emailToSend,
          replyTo: "admin@grodify.com",
          subject: `Purchase Received - ${orderIdsText}`,
          html: purchaseHtml,
        });

        console.log(`📧 Purchase email sent for ${createdOrderIds.length} order(s)`);

      } catch (emailError: any) {
        console.error(`❌ Email failed:`, emailError.message);
      }
    }

    // Success redirect
    return NextResponse.redirect(
      new URL(`/thank-you?orderId=${createdOrderIds.join(',')}&session_id=${sessionId}&order_created=true`, baseUrl)
    )

  } catch (error: any) {
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