import { NextRequest, NextResponse } from 'next/server';
import { awsConfig } from '@/config/aws-config';

export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
        }

        // Use environment variables for flexibility
        const rawDomain = process.env.NEXT_PUBLIC_AWS_COGNITO_DOMAIN || awsConfig.oauth.domain;
        const COGNITO_DOMAIN = rawDomain.startsWith('http') ? rawDomain : `https://${rawDomain}`;

        const CLIENT_ID = process.env.NEXT_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID || awsConfig.userPoolWebClientId;

        const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://grodify.com';
        const REDIRECT_URI = `${BASE_URL}/auth/callback`;

        const tokenEndpoint = `${COGNITO_DOMAIN}/oauth2/token`;

        const body = new URLSearchParams();
        body.append('grant_type', 'authorization_code');
        body.append('client_id', CLIENT_ID);
        body.append('code', code);
        body.append('redirect_uri', REDIRECT_URI);

        console.log('Exchanging code for token:', { endpoint: tokenEndpoint, clientId: CLIENT_ID });

        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Cognito token exchange failed:', data);
            return NextResponse.json(
                { error: data.error_description || data.error || 'Token exchange failed' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
