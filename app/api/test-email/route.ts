import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const toEmail = searchParams.get('to') || process.env.AWS_SES_FROM_EMAIL || 'ankitoffice121@gmail.com';

    console.log(`🧪 Testing Email...`);
    console.log(`From: ${process.env.AWS_SES_FROM_EMAIL}`);
    console.log(`To: ${toEmail}`);
    console.log(`Region: ${process.env.AWS_REGION}`);
    console.log(`Key ID: ${process.env.AWS_ACCESS_KEY_ID ? '***' + process.env.AWS_ACCESS_KEY_ID.slice(-4) : 'MISSING'}`);

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
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      details: error
    }, { status: 500 });
  }
}
