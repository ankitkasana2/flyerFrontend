import { NextResponse } from "next/server";
import { render } from "@react-email/render";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, flyerType, image_url, total_price } = body;

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Simulated order creation
        const orderId = `ORD-${Date.now()}`;

        // Send confirmation email via Resend
        const { resend } = await import("@/lib/resend");
        const { OrderConfirmationEmail } = await import("@/emails/OrderConfirmation");

        const emailHtml = await render(
            <OrderConfirmationEmail
                name={name || "Customer"}
                orderId={orderId}
                flyerName={flyerType || "Professional Flyer"}
                total={total_price?.toString() || "0"}
                imageUrl={image_url}
                date={new Date().toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                })}
            />
        );

        await resend.emails.send({
            from: "Grodify <support@mail.grodify.com>",
            to: email,
            replyTo: "admin@grodify.com",
            subject: `Order Confirmation - ${orderId}`,
            html: emailHtml,
        });

        return NextResponse.json({
            success: true,
            orderId,
        });
    } catch (error: any) {
        console.error("Order creation error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create order" },
            { status: 500 }
        );
    }
}
