import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import { OrderConfirmationEmail } from '@/emails/OrderConfirmation';
import { render } from '@react-email/render';

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const toEmail = searchParams.get('to') || 'admin@grodify.com';

    const orderId = 'TEST-' + Math.floor(Math.random() * 1000000);

    const emailHtml = await render(
      <OrderConfirmationEmail
        name="Test Customer"
        orderId={orderId}
        flyerName="Premium Club Night Flyer"
        total="99.99"
        imageUrl="https://images.unsplash.com/photo-1514525253344-a8130819e017?w=1200&auto=format&fit=crop&q=80"
        date={new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      />
    );

    const data = await resend.emails.send({
      from: "Grodify <support@mail.grodify.com>",
      to: toEmail,
      replyTo: "admin@grodify.com",
      subject: `Order Confirmation - #${orderId}`,
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      data,
      message: `Test email sent successfully to ${toEmail}`
    });

  } catch (error: any) {
    console.error("Test email error:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
