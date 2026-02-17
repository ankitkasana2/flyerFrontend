"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/stores/StoreProvider";
import { observer } from "mobx-react-lite";
import { IOSLoader } from "@/components/ui/ios-loader";
import { Hub } from 'aws-amplify/utils';

const CallbackPage = observer(() => {
    const router = useRouter();
    const { authStore } = useStore();

    useEffect(() => {
        // If user is already logged in, redirect home
        if (authStore.user) {
            router.push("/");
            return;
        }

        // Listen for successful sign-in redirect
        const listener = Hub.listen('auth', ({ payload }) => {
            if (payload.event === 'signInWithRedirect' || payload.event === 'signedIn') {
                // Allow a small delay for state updates
                setTimeout(() => router.push("/"), 100);
            }
            if (payload.event === 'signInWithRedirect_failure') {
                router.push("/login?error=auth_failed");
            }
        });

        return () => listener();
    }, [authStore.user, router]);

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
