"use client";

import { observer } from "mobx-react-lite";
import { useStore } from "@/stores/StoreProvider";
import { RefreshingDesignLoader } from "./refreshing-design-loader";

const GlobalLoader = observer(() => {
    const { loadingStore } = useStore();

    if (!loadingStore.isLoading) return null;

    return <RefreshingDesignLoader fullScreen text={loadingStore.loadingText || "REFRESHING DESIGN"} />;
});

export default GlobalLoader;
