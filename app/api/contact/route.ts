import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const { name, email, subject, message } = await request.json();

        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">New Contact Form Submission</h2>
                <div style="margin-top: 20px;">
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <div style="margin-top: 20px; padding: 15px; bg-color: #f9f9f9; border-left: 4px solid #ef4444;">
                        <p><strong>Message:</strong></p>
                        <p style="white-space: pre-wrap;">${message}</p>
                    </div>
                </div>
                <div style="margin-top: 30px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
                    This message was sent from the Grodify Contact Form.
                </div>
            </div>
        `;

        await sendEmail({
            to: 'admin@grodify.com',
            subject: `Contact Form: ${subject}`,
            html: html,
        });

        return NextResponse.json({ success: true, message: 'Message sent successfully' });
    } catch (error: any) {
        console.error('Contact API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
