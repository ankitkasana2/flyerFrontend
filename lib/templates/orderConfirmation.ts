interface OrderConfirmationParams {
  name: string;
  orderId: string;
  flyerType: string;
  totalPrice?: number;
  imageUrl?: string;
  customerEmail: string;
  deliveryTime?: string;
}

import fs from 'fs';
import path from 'path';

export const orderConfirmationTemplate = ({
  name,
  orderId,
  flyerType,
  totalPrice,
  imageUrl,
  customerEmail,
  deliveryTime,
}: OrderConfirmationParams) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Convert logo to base64 to ensure it shows up even on localhost
  let logoBase64 = '';
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    }
  } catch (error) {
    console.error('Error loading logo for email:', error);
  }

  const logoUrl = logoBase64 || `${baseUrl}/logo.png`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Confirmed</title>
</head>
<body style="margin:0; padding:0; background-color:#000000; font-family: Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000; padding:30px 0;">
    <tr>
      <td align="center">
        
        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#141414; border-radius:12px; overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding:30px; text-align:center; background-color:#000000;">
              <img src="${logoUrl}" alt="Logo" width="140" style="display:block; margin:0 auto;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px; color:#ffffff;">
              <p style="color:#E50914; font-size:14px; letter-spacing:2px; margin-bottom:10px;">
                ORDER CONFIRMED
              </p>

              <h1 style="font-size:28px; margin:0 0 20px; font-weight:700;">
                Hi ${name && name !== "Valued Customer" ? name : 'there'},
              </h1>

              <p style="font-size:16px; line-height:1.6; color:#b3b3b3;">
                Your order for <strong style="color:#ffffff;">${flyerType}</strong> is now in production.
                Our creative team has started working on it.
              </p>

              <!-- Side by Side Layout -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:30px;">
                <tr>
                  <!-- Flyer Image on the Left (Larger) -->
                  <td width="50%" valign="top" align="left">
                    ${imageUrl ? `
                    <div style="border:1px solid #333; border-radius:8px; overflow:hidden; background-color:#000;">
                      <img src="${imageUrl}" alt="Flyer Preview" style="width:100%; height:auto; display:block;" />
                    </div>
                    ` : `
                    <div style="border:1px dashed #333; border-radius:8px; padding:60px 10px; text-align:center; color:#555; background-color:#141414;">
                      <p style="font-size:12px; margin:0;">Design Preview</p>
                    </div>
                    `}
                  </td>

                  <td width="5%">&nbsp;</td>

                  <!-- Order Details on the Right -->
                  <td width="45%" valign="top">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1f1f1f; border-radius:8px;">
                      <tr>
                        <td style="padding:12px; font-size:13px; color:#b3b3b3;">Order ID</td>
                        <td style="padding:12px; font-size:13px; text-align:right; color:#ffffff; font-weight:600;">#${orderId}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px; font-size:13px; color:#b3b3b3;">Flyer</td>
                        <td style="padding:12px; font-size:13px; text-align:right; color:#ffffff;">${flyerType}</td>
                      </tr>
                      ${deliveryTime ? `
                      <tr>
                        <td style="padding:12px; font-size:13px; color:#b3b3b3;">Delivery</td>
                        <td style="padding:12px; font-size:13px; text-align:right; color:#ffffff;">${deliveryTime}</td>
                      </tr>` : ''}
                      <tr>
                        <td style="padding:15px; font-size:16px; color:#ffffff; font-weight:700; border-top:1px solid #333;">
                          Paid
                        </td>
                        <td style="padding:15px; text-align:right; font-size:16px; color:#E50914; font-weight:700; border-top:1px solid #333;">
                          $${totalPrice || '0.00'}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <div style="text-align:center; margin-top:40px;">
                <a href="${baseUrl}/profile"
                   style="background-color:#E50914; color:#ffffff; padding:14px 32px;
                          text-decoration:none; font-weight:700; border-radius:6px; display:inline-block;">
                  Track Your Order
                </a>
              </div>

              <p style="margin-top:30px; font-size:14px; color:#b3b3b3; text-align:center;">
                We’ll notify you when your design is ready to watch ✨
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:25px; background-color:#000000; text-align:center; font-size:12px; color:#808080;">
              <p style="margin:5px 0;">© ${new Date().getFullYear()} Grodify</p>
              <p style="margin:5px 0;">
                <a href="${baseUrl}/contact" style="color:#E50914; text-decoration:none;">Help Center</a> ·
                <a href="#" style="color:#E50914; text-decoration:none;">Support</a>
              </p>
            </td>
          </tr>

        </table>
        <!-- End Card -->

      </td>
    </tr>
  </table>

</body>
</html>
`;
};
