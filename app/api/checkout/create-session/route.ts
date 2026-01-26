import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

export async function POST(request: Request) {
  try {
    const { amount, orderData } = await request.json()

    // Determine the base URL dynamically to avoid 0.0.0.0 issues
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl || baseUrl.includes('0.0.0.0')) {
      const host = request.headers.get('host')
      const protocol = request.headers.get('x-forwarded-proto') || 'http' 
      if (host && !host.includes('0.0.0.0')) {
        baseUrl = `${protocol}://${host}`
      } else {
        // Fallback to localhost if host is also invalid/missing (unlikely in real request)
        baseUrl = 'http://localhost:3000'
      }
      console.log('⚠️ Adapted Base URL for Stripe:', baseUrl)
    }

    console.log('✅ Creating checkout session for:', orderData.userEmail)

    // Encode order data as base64 to store in Stripe metadata
    const orderDataString = JSON.stringify(orderData)
    const orderDataBase64 = Buffer.from(orderDataString).toString('base64')


    // Check if metadata is too large (Stripe limit is 500 chars per field)
    if (orderDataBase64.length > 500) {
      console.error('❌ Order data too large for Stripe metadata:', orderDataBase64.length, 'bytes')

      // Split into chunks of 500 characters
      const chunkSize = 500
      const chunks = []
      for (let i = 0; i < orderDataBase64.length; i += chunkSize) {
        chunks.push(orderDataBase64.substring(i, i + chunkSize))
      }


      // Create metadata object with chunks
      const metadata: any = {
        userId: orderData.userId || '',
        userEmail: orderData.userEmail || '',
        totalPrice: amount.toString(),
        chunkCount: chunks.length.toString()
      }

      // Add each chunk (Stripe allows up to 50 metadata keys)
      chunks.forEach((chunk, index) => {
        metadata[`orderData_${index}`] = chunk
      })

      // Ensure image URL is valid for Stripe (must be absolute)
      let imageUrl = orderData.formData?.image_url;
      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://193.203.161.174:3007";
        imageUrl = `${apiBaseUrl.replace(/\/$/, '')}/${imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl}`;
      }

      // Create Stripe session with chunked metadata
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Flyer Design Order',
                description: `Custom flyer for ${orderData.formData?.presenting || 'Event'}`,
                images: imageUrl ? [imageUrl] : [],
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/order/${orderData.formData.flyer_is}`,
        metadata: metadata,
      })

      return NextResponse.json({ sessionId: session.id })
    }

    // Ensure image URL is valid for Stripe (must be absolute)
    let imageUrl = orderData.formData?.image_url;
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://193.203.161.174:3007";
      imageUrl = `${apiBaseUrl.replace(/\/$/, '')}/${imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl}`;
    }

    // If data fits in one field, use simple approach
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Flyer Design Order',
              description: `Custom flyer for ${orderData.formData?.presenting || 'Event'}`,
              images: imageUrl ? [imageUrl] : [],
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/order/${orderData.formData.flyer_is}`,
      metadata: {
        orderData: orderDataBase64,
        userId: orderData.userId || '',
        userEmail: orderData.userEmail || '',
        totalPrice: amount.toString(),
      },
    })

    return NextResponse.json({ sessionId: session.id })

  } catch (error: any) {
    console.error('❌ Stripe checkout error:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
