"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { observer } from "mobx-react-lite";
import { useStore } from "@/stores/StoreProvider";
import { IOSLoader } from "./ios-loader";

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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="flex flex-col items-center gap-4">
                <IOSLoader
                    size="lg"
                    color="text-primary"
                />
                <p className="text-white/50 text-xs font-medium tracking-[0.3em] uppercase animate-pulse">
                    Refreshing Design
                </p>
            </div>
        </div>
    );
});

export default PageTransitionLoader;
