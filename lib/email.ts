import AWS from 'aws-sdk';
import { orderConfirmationTemplate } from "@/lib/templates/orderConfirmation";

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
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        throw new Error("AWS SES credentials not configured");
    }

    if (!process.env.AWS_SES_FROM_EMAIL) {
        throw new Error("AWS_SES_FROM_EMAIL not configured");
    }

    const params = {
        Source: `Grodify <${process.env.AWS_SES_FROM_EMAIL}>`,
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
        const result = await ses.sendEmail(params).promise();
        return result;
    } catch (error: any) {
        console.error("❌ Error sending email:", error);
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
    const { customerEmail, customerName, orderId, flyerName, totalPrice, details, imageUrl } = params;

    const html = orderConfirmationTemplate({
        name: customerName,
        orderId,
        flyerType: flyerName,
        totalPrice: totalPrice,
        imageUrl: imageUrl,
        customerEmail: customerEmail,
        deliveryTime: details?.deliveryTime,
    });

    try {
        return await sendEmail({
            to: customerEmail,
            subject: `Order Confirmation – #${orderId}`,
            html,
        });
    } catch (error) {
        console.error('📧 ❌ sendOrderConfirmationEmail failed:', error);
        throw error;
    }
};

