import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('d:/Flyer/flyerFrontend/.env.local') });

const apiKey = process.env.RESEND_API_KEY;
console.log('API Key starts with:', apiKey?.substring(0, 5));

const resend = new Resend(apiKey);

async function test() {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Grodify <support@mail.grodify.com>',
            to: 'ankitoffice121@gmail.com',
            subject: 'Manual Test from Terminal',
            html: '<strong>Success!</strong> If you see this, the API key and Resend setup are correct.',
        });

        if (error) {
            console.error('Resend Error:', error);
        } else {
            console.log('Resend Success!', data);
        }
    } catch (e) {
        console.error('Catastrophic Failure:', e);
    }
}

test();
