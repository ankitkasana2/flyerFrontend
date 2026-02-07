import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const toEmail = searchParams.get('to') || process.env.AWS_SES_FROM_EMAIL || 'admin@grodify.com';

    const result = await sendOrderConfirmationEmail({
      orderId: 'TEST-888999',
      customerName: 'Ankit Kasana',
      customerEmail: toEmail,
      flyerName: 'Premium Club Night Flyer',
      details: {
        price: 99.99,
        extras: ['VIP Package', 'Social Media Kit'],
        deliveryTime: 'Within 24 Hours'
      },
      totalPrice: 99.99,
      imageUrl: 'https://images.unsplash.com/photo-1514525253344-a8130819e017?w=1200&auto=format&fit=crop&q=80'
    });

    if (result && result.MessageId) {
      return NextResponse.json({
        success: true,
        messageId: result.MessageId,
        message: `Email sent successfully to ${toEmail}`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: "Email function completed but didn't return a result."
      }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: 500 });
  }
}
