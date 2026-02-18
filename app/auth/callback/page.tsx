"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/stores/StoreProvider";
import { observer } from "mobx-react-lite";
import { IOSLoader } from "@/components/ui/ios-loader";
import { registerUserInDatabase, formatCognitoUserId } from "@/lib/api-client";
import { Hub } from 'aws-amplify/utils';

const CallbackPage = observer(() => {
    const router = useRouter();
    const { authStore } = useStore();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (!code) {
            // Check if already logged in
            if (authStore.user) {
                router.push("/");
            } else {
                // If no code and not logged in, maybe it's just a direct access or failure
                const error = urlParams.get('error');
                if (error) {
                    router.push(`/login?error=${error}`);
                }
            }
            return;
        }

        const exchangeCode = async () => {
            try {
                const response = await fetch('/api/auth/cognito', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code }),
                });

                const data = await response.json();

                if (!response.ok) {
                    console.error('Token exchange failed:', data);
                    router.push("/?error=auth_failed");
                    return;
                }

                const { id_token, access_token } = data;

                // Decode token to get user info
                if (id_token) {
                    try {
                        const payload = JSON.parse(atob(id_token.split('.')[1]));

                        // Extract user info
                        const email = payload.email || "";
                        const name = payload.name || payload.given_name || payload.nickname || email;

                        // Detect provider
                        let provider = 'cognito';
                        if (payload.identities && Array.isArray(payload.identities) && payload.identities.length > 0) {
                            const providerName = payload.identities[0].providerName?.toLowerCase() || '';
                            if (providerName.includes('google')) {
                                provider = 'google';
                            } else if (providerName.includes('apple')) {
                                provider = 'apple';
                            }
                        }

                        // Generate normalized user
                        const userId = payload.sub || payload['cognito:username'] || "";
                        const formattedUserId = formatCognitoUserId(userId, provider);

                        const user = {
                            id: formattedUserId,
                            name: name,
                            email: email,
                            provider: provider,
                            favorites: [],
                            orders: [],
                            createdAt: new Date().toISOString()
                        };

                        // Update store
                        authStore.setSession(user, id_token);

                        // Register in backend database
                        try {
                            await registerUserInDatabase({
                                fullname: user.name,
                                email: user.email,
                                user_id: user.id
                            });
                        } catch (dbErr) {
                            console.error("DB registration error:", dbErr);
                        }

                        // Success!
                        router.push("/");
                    } catch (decodeErr) {
                        console.error("Token decoding error:", decodeErr);
                        router.push("/?error=token_invalid");
                    }
                } else {
                    router.push("/?error=no_token");
                }
            } catch (error) {
                console.error("Exchange error:", error);
                router.push("/?error=network_error");
            }
        };

        exchangeCode();

    }, [authStore, router]);

    return (
        <IOSLoader
            size="xl"
            text="Logging you in..."
            color="text-red-500"
            fullScreen={true}
        />
    );
});

export default CallbackPage;
