import AWS from 'aws-sdk';

// Initialize SES
// Ensure AWS credentials are set in environment variables:
// AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
const ses = new AWS.SES({
  region: process.env.AWS_REGION || 'us-east-1',
  apiVersion: '2010-12-01',
});

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  flyerName: string;
  details: {
    price: number;
    extras?: string[]; // e.g. ["Story Size (+$10)", "Animated (+$25)"]
    deliveryTime?: string;
  };
  totalPrice: number;
  imageUrl?: string;
}

export const generateOrderEmailHtml = (data: OrderEmailData) => {
  const { orderId, customerName, flyerName, details, totalPrice, imageUrl } = data;

  const extrasHtml = details.extras && details.extras.length > 0
    ? `
      <div style="margin-top: 10px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
        <strong style="color: #333;">Extras:</strong>
        <ul style="margin: 5px 0 0 20px; padding: 0; color: #555;">
          ${details.extras.map(extra => `<li>${extra}</li>`).join('')}
        </ul>
      </div>
    `
    : '';

  const imageHtml = imageUrl
    ? `<div style="text-align: center; margin: 20px 0;">
         <img src="${imageUrl}" alt="${flyerName}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
       </div>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #000000; color: #ffffff; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
    
    <!-- Branding Header -->
    <div style="background: linear-gradient(135deg, #b92025 0%, #000000 100%); padding: 30px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; letter-spacing: 1px;">FLYER APP</h1>
      <p style="margin: 5px 0 0; color: #cccccc; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Premium Designs</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="margin-top: 0; color: #ffffff; font-size: 24px;">Order Confirmed!</h2>
      <p style="color: #cccccc; line-height: 1.6;">Hi ${customerName},</p>
      <p style="color: #cccccc; line-height: 1.6;">Thank you for your purchase. We've received your order and our team is getting ready to create something amazing for you.</p>

      <!-- Order Details Card -->
      <div style="background-color: #2a2a2a; border-radius: 8px; padding: 20px; margin-top: 30px; border: 1px solid #333;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #444; padding-bottom: 15px; margin-bottom: 15px;">
          <span style="color: #999; font-size: 14px;">Order Number</span>
          <span style="color: #ffffff; font-family: monospace; font-size: 16px;">#${orderId}</span>
        </div>

        ${imageHtml}

        <div style="margin-bottom: 15px;">
          <h3 style="margin: 0 0 5px; color: #ffffff; font-size: 18px;">${flyerName}</h3>
          <p style="margin: 0; color: #888; font-size: 14px;">${details.deliveryTime ? `Delivery: ${details.deliveryTime}` : ''}</p>
        </div>

        ${extrasHtml}

        <div style="border-top: 1px solid #444; margin-top: 20px; padding-top: 20px; display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #ffffff; font-weight: bold; font-size: 18px;">Total</span>
          <span style="color: #b92025; font-weight: bold; font-size: 24px;">$${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      <!-- Next Steps -->
      <div style="margin-top: 30px;">
        <h3 style="color: #ffffff; font-size: 18px; margin-bottom: 10px;">What's Next?</h3>
        <p style="color: #999; font-size: 14px; line-height: 1.6;">
          Our designers will review your requirements and start working on your flyer. You will receive the first draft within the selected delivery time.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #000000; padding: 20px; text-align: center; border-top: 1px solid #333;">
      <p style="margin: 0; color: #555; font-size: 12px;">&copy; ${new Date().getFullYear()} Flyer App. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const sendOrderConfirmationEmail = async (data: OrderEmailData) => {
  
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ AWS credentials missing from process.env');
    console.error('AWS_ACCESS_KEY_ID present:', !!process.env.AWS_ACCESS_KEY_ID);
    console.error('AWS_SECRET_ACCESS_KEY present:', !!process.env.AWS_SECRET_ACCESS_KEY);
    return;
  }

  // Update SES config with latest env vars (in case of hot reload issues)
  const currentRegion = process.env.AWS_REGION || 'ap-southeast-2';
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: currentRegion
  });

  const fromEmail = process.env.AWS_SES_FROM_EMAIL || 'ankitoffice121@gmail.com';

  const params: AWS.SES.SendEmailRequest = {
    Source: fromEmail,
    Destination: {
      ToAddresses: [data.customerEmail],
    },
    Message: {
      Subject: {
        Data: `Order Confirmation #${data.orderId}`,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: generateOrderEmailHtml(data),
          Charset: 'UTF-8',
        },
        Text: {
          Data: `Thank you for your order #${data.orderId}. Total: $${data.totalPrice}. Your design for ${data.flyerName} is in progress.`,
          Charset: 'UTF-8',
        },
      },
    },
  };

  try {
    const result = await ses.sendEmail(params).promise();
    return result;
  } catch (error: any) {
    console.error('❌ Failed to verify/send SES email:', error);
    if (error.code === 'MessageRejected') {
      console.error('Tip: If you are in SES Sandbox mode, you must verify BOTH the "From" and "To" email addresses in AWS Console.');
    }
    if (error.code === 'InvalidClientTokenId') {
      console.error('Tip: Check if your AWS_ACCESS_KEY_ID is correct.');
    }
  }
};
