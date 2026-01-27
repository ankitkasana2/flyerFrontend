import AWS from 'aws-sdk';
import { orderConfirmationTemplate } from "@/lib/templates/orderConfirmation";

console.log('📧 ========== EMAIL MODULE LOADED ==========');
console.log('📧 AWS_REGION:', process.env.AWS_REGION);
console.log('📧 AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing');
console.log('📧 AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing');
console.log('📧 AWS_SES_FROM_EMAIL:', process.env.AWS_SES_FROM_EMAIL);
console.log('📧 ==========================================');

// Configure AWS SES
const ses = new AWS.SES({
    apiVersion: '2010-12-01',
    region: process.env.AWS_REGION || 'ap-southeast-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
    // Validate AWS credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.error("❌ AWS SES credentials missing!");
        throw new Error("AWS SES credentials not configured");
    }

    if (!process.env.AWS_SES_FROM_EMAIL) {
        console.error("❌ AWS_SES_FROM_EMAIL not configured!");
        throw new Error("AWS_SES_FROM_EMAIL not configured");
    }

    const params = {
        Source: process.env.AWS_SES_FROM_EMAIL,
        Destination: {
            ToAddresses: [to],
        },
        Message: {
            Subject: {
                Data: subject,
                Charset: 'UTF-8',
            },
            Body: {
                Html: {
                    Data: html,
                    Charset: 'UTF-8',
                },
            },
        },
    };

    try {
        console.log(`📧 Sending email to: ${to}`);
        console.log(`📧 From: ${process.env.AWS_SES_FROM_EMAIL}`);
        console.log(`📧 Subject: ${subject}`);

        const result = await ses.sendEmail(params).promise();
        console.log(`✅ Email sent successfully! MessageId: ${result.MessageId}`);
        return result;
    } catch (error: any) {
        console.error("❌ Error sending email:", error);
        console.error("Error details:", {
            code: error.code,
            message: error.message,
            statusCode: error.statusCode,
        });
        throw error;
    }
};

interface SendOrderConfirmationParams {
    orderId: string;
    customerName: string;
    customerEmail: string;
    flyerName: string;
    details?: {
        price: number;
        extras: string[];
        deliveryTime: string;
    };
    totalPrice?: number;
    imageUrl?: string;
}

export const sendOrderConfirmationEmail = async (params: SendOrderConfirmationParams) => {
    console.log('📧 ========== sendOrderConfirmationEmail CALLED ==========');
    console.log('📧 Full params:', JSON.stringify(params, null, 2));

    const { customerEmail, customerName, orderId, flyerName, totalPrice, details } = params;

    console.log(`📧 Preparing order confirmation email for: ${customerEmail}`);
    console.log(`📧 Order ID: ${orderId}`);
    console.log(`📧 Customer Name: ${customerName}`);
    console.log(`📧 Flyer Name: ${flyerName}`);

    // Use the existing template. 
    // TODO: Update template to include price and details if needed.
    const html = orderConfirmationTemplate({
        name: customerName,
        orderId,
        flyerType: flyerName,
    });

    console.log(`📧 HTML template generated, length: ${html.length} characters`);
    console.log(`📧 Calling sendEmail function...`);

    try {
        const result = await sendEmail({
            to: customerEmail,
            subject: `Order Confirmation – ${orderId}`,
            html,
        });
        console.log('📧 ✅ sendOrderConfirmationEmail completed successfully');
        return result;
    } catch (error) {
        console.error('📧 ❌ sendOrderConfirmationEmail failed:', error);
        throw error;
    }
};
