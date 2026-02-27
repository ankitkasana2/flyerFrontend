"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/stores/StoreProvider";
import { observer } from "mobx-react-lite";
import { RefreshingDesignLoader } from "@/components/ui/refreshing-design-loader";
import { registerUserInDatabase, formatCognitoUserId } from "@/lib/api-client";

const CallbackPage = observer(() => {
    const router = useRouter();
    const { authStore } = useStore();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        const redirectHome = () => router.replace("/");

        if (error) {
            const encoded = encodeURIComponent(errorDescription || error);
            router.replace(`/?error=${encoded}`);
            return;
        }

        if (!code) {
            // Check if already logged in
            if (authStore.user) {
                redirectHome();
            } else {
                // If no code and not logged in, maybe it's just a direct access or failure
                router.replace("/?error=missing_code");
            }
            return;
        }

        const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

        const syncAmplifySession = async () => {
            for (let attempt = 0; attempt < 4; attempt += 1) {
                const user = await authStore.updateUserFromAmplify();
                if (user) {
                    return true;
                }
                await wait(250);
            }
            return false;
        };

        const exchangeCode = async () => {
            const redirectUri = `${window.location.origin}/auth/callback`;

            // Amplify can already process the code. Prefer that path first.
            if (await syncAmplifySession()) {
                redirectHome();
                return;
            }

            try {
                let response: Response | null = null;
                let data: any = null;

                // Retry once for transient first-call failures seen in hosted UI redirects.
                for (let attempt = 0; attempt < 2; attempt += 1) {
                    response = await fetch('/api/auth/cognito', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code, redirectUri }),
                    });

                    data = await response.json();
                    if (response.ok || attempt === 1) {
                        break;
                    }
                    await wait(400);
                }

                if (!response || !response.ok) {
                    console.error('Token exchange failed:', data);
                    if (await syncAmplifySession()) {
                        redirectHome();
                        return;
                    }
                    router.replace("/?error=auth_failed");
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
                        redirectHome();
                    } catch (decodeErr) {
                        console.error("Token decoding error:", decodeErr);
                        router.replace("/?error=token_invalid");
                    }
                } else {
                    if (await syncAmplifySession()) {
                        redirectHome();
                        return;
                    }
                    router.replace("/?error=no_token");
                }
            } catch (error) {
                console.error("Exchange error:", error);
                if (await syncAmplifySession()) {
                    redirectHome();
                    return;
                }
                router.replace("/?error=network_error");
            }
        };

        exchangeCode();

    }, [authStore, router]);

    return (
        <RefreshingDesignLoader fullScreen />
    );
});

export default CallbackPage;
