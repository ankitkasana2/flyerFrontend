import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email';

console.log('🧪 test-email route loaded');
console.log('🧪 sendOrderConfirmationEmail type:', typeof sendOrderConfirmationEmail);

export async function GET(request: Request) {
  console.log('🧪 ========== TEST EMAIL ENDPOINT CALLED ==========');

  try {
    const { searchParams } = new URL(request.url);
    const toEmail = searchParams.get('to') || process.env.AWS_SES_FROM_EMAIL || 'ankitoffice121@gmail.com';

    console.log('🧪 Target email:', toEmail);
    console.log('🧪 About to call sendOrderConfirmationEmail...');

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
      imageUrl: 'https://images.unsplash.com/photo-1514525253344-a8130819e017?w=1200&auto=format&fit=crop&q=80' // Using a placeholder premium flyer image
    });

    console.log('🧪 Result received:', result);

    if (result && result.MessageId) {
      return NextResponse.json({
        success: true,
        messageId: result.MessageId,
        message: `Email sent successfully to ${toEmail}`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: "Email function completed but didn't return a result. Check server logs."
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('🧪 ❌ Test email error:', error);
    console.error('🧪 Error stack:', error.stack);

    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      stack: error.stack,
      details: error
    }, { status: 500 });
  }
}
