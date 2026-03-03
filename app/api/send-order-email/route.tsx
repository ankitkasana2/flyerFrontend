
import { resend } from "@/lib/resend";
import { OrderConfirmationEmail } from "@/emails/OrderConfirmation";
import { render } from "@react-email/render";

export async function POST(req: Request) {
    try {
        const { email, orderId, name, total, flyerName, imageUrl } = await req.json();

        const emailHtml = await render(
            <OrderConfirmationEmail
                name={name}
                orderId={orderId}
                flyerName={flyerName || "Professional Flyer"}
                total={total}
                imageUrl={imageUrl}
                date={new Date().toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                })}
            />
        );

        const data = await resend.emails.send({
            from: "Grodify <support@mail.grodify.com>",
            to: email,
            replyTo: "admin@grodify.com",
            subject: `Order Confirmation - ${orderId}`,
            html: emailHtml,
        });

        return Response.json({ success: true, data });
    } catch (error) {
        console.error("Resend error:", error);
        return Response.json({ success: false, error: "Failed to send email" }, { status: 500 });
    }
}


