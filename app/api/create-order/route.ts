import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { orderConfirmationTemplate } from "@/lib/templates/orderConfirmation";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, flyerType } = body;

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Simulated order creation
        const orderId = `ORD-${Date.now()}`;

        await sendEmail({
            to: email,
            subject: `Order Confirmation – ${orderId}`,
            html: orderConfirmationTemplate({
                name: name || "Customer",
                orderId,
                flyerType: flyerType || "Standard Flyer",
            }),
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
