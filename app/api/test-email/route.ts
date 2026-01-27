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
      orderId: 'TEST-123456',
      customerName: 'Test User',
      customerEmail: toEmail,
      flyerName: 'Test Flyer Design',
      details: {
        price: 50.00,
        extras: ['Test Extra 1', 'Test Extra 2'],
        deliveryTime: '24 Hours'
      },
      totalPrice: 50.00,
      imageUrl: 'https://via.placeholder.com/300'
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
