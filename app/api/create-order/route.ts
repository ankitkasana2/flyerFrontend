import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, flyerType } = body;

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Simulated order creation
        const orderId = `ORD-${Date.now()}`;

        const { sendOrderConfirmationEmail } = await import("@/lib/email");
        await sendOrderConfirmationEmail({
            customerEmail: email,
            customerName: name || "Customer",
            orderId,
            flyerName: flyerType || "Standard Flyer",
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
