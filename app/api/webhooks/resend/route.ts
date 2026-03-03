import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        const { type, data } = payload;

        console.log(`[Resend Webhook] Received event: ${type}`);

        switch (type) {
            case "email.sent":
                console.log(`Email sent: ${data.email_id}`);
                break;
            case "email.delivered":
                console.log(`Email delivered: ${data.email_id}`);
                // Update DB status if you have a tracking table
                break;
            case "email.bounced":
                console.warn(`Email bounced: ${data.email_id}`);
                // Notify admin or log failure
                break;
            case "email.complained":
                console.error(`Email complaint: ${data.email_id}`);
                break;
            default:
                console.log(`Unhandled event type: ${type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}
