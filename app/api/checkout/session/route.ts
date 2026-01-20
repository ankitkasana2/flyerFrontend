
export const dynamic = "force-dynamic";
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { item } = await req.json();

    const origin = req.headers.get("x-forwarded-proto")
      ? `${req.headers.get("x-forwarded-proto")}://${req.headers.get("host")}`
      : req.headers.get("origin") || "http://localhost:3000";

    const itemsArray = Array.isArray(item) ? item : [item];

    // Store complete order data in sessionStorage (client-side) and use minimal metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: itemsArray.map((i: any) => {

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: i?.eventDetails?.mainTitle || "Event Ticket",
            },
            unit_amount: Number(i?.subtotal) * 100,
          },
          quantity: 1,
        };
      }),
      success_url: `${origin}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      metadata: {
        // Store only essential info - the rest comes from sessionStorage
        userId: item?.user_id || '',
        flyerId: item?.flyer_id || '',
        totalPrice: item?.total_price || '0',
        eventTitle: item?.event_title || 'Event',
        subtotal: item?.subtotal || '0',
        // Store a flag to indicate we should use sessionStorage data
        useSessionStorage: 'true'
      },
    });

    if (!session.url) throw new Error("Stripe session URL not created");

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
