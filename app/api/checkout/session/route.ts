
export const dynamic = "force-dynamic";
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/config/api";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { item } = await req.json();

    const origin = req.headers.get("x-forwarded-proto")
      ? `${req.headers.get("x-forwarded-proto")}://${req.headers.get("host")}`
      : req.headers.get("origin") || "http://localhost:3000";

    const itemsArray = Array.isArray(item) ? item : [item];

    // Build metadata for the success handler - INCLUDE ALL ITEMS for multi-order creation
    const firstItem = itemsArray[0];
    const orderData = {
      userId: firstItem.user_id || firstItem.userId,
      userEmail: firstItem.email || firstItem.userEmail || firstItem.user_email,
      items: itemsArray.map((i: any) => ({
        ...i,
        flyer_id: i.flyer_id || i.flyer_is,
        total_price: i.total_price || i.subtotal || 0,
        address_phone: i.address_phone || i.address_and_phone || '',
      }))
    };

    const orderDataString = JSON.stringify(orderData);
    const orderDataBase64 = Buffer.from(orderDataString).toString('base64');

    const metadata: any = {
      userId: orderData.userId || '',
      userEmail: orderData.userEmail || '',
      totalPrice: itemsArray.reduce((sum: number, i: any) => sum + Number(i.subtotal || i.total_price || 0), 0).toString(),
      source: 'cart', // Identify this came from the cart
    };

    // Handle chunking if metadata is too large
    if (orderDataBase64.length > 500) {
      const chunkSize = 500;
      const chunks = [];
      for (let i = 0; i < orderDataBase64.length; i += chunkSize) {
        chunks.push(orderDataBase64.substring(i, i + chunkSize));
      }
      metadata.chunkCount = chunks.length.toString();
      chunks.forEach((chunk, index) => {
        metadata[`orderData_${index}`] = chunk;
      });
    } else {
      metadata.orderData = orderDataBase64;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: itemsArray.map((i: any) => {
        const priceStr = String(i.subtotal || i.total_price || 0);
        const amount = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;

        // Ensure image URL is valid for Stripe (must be absolute)
        let imageUrl = i.image_url || i.flyer?.image || i.venue_logo;

        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
          const apiBaseUrl = API_BASE_URL;
          imageUrl = `${apiBaseUrl.replace(/\/$/, '')}/${imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl}`;
        }

        const images = imageUrl ? [imageUrl] : [];

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: i?.eventDetails?.mainTitle || i?.event_title || "Flyer Order",
              description: i?.presenting ? `Custom flyer for ${i.presenting}` : undefined,
              images: images,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }
      }),
      success_url: `${origin}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: metadata,
    });

    if (!session.url) throw new Error("Stripe session URL not created");

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
