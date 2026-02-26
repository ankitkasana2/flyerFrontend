"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { observer } from "mobx-react-lite";
import { useStore } from "@/stores/StoreProvider";
import { RefreshingDesignLoader } from "./refreshing-design-loader";

const PageTransitionLoader = observer(() => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { loadingStore } = useStore();

    useEffect(() => {
        // Disabled automatic loader on route change for smoother navigation
        // loadingStore.startLoading("Loading...");

        // const timer = setTimeout(() => {
        //     loadingStore.stopLoading();
        // }, 800);

        return () => {
            // clearTimeout(timer);
            // loadingStore.stopLoading(); 
        };
    }, [pathname, searchParams, loadingStore]);

    if (!loadingStore.isLoading) return null;

    return <RefreshingDesignLoader fullScreen />;
});

export default PageTransitionLoader;
