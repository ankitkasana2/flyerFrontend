"use client"
"use client"

import { useEffect } from "react"
import { useStore } from "@/stores/StoreProvider"

/**
 * FavoritesSync component
 * Automatically fetches user's favorites when they log in or on page load
 * This component should be placed in the root layout
 */
export function FavoritesSync() {
    const { authStore, favoritesStore } = useStore()

    // Use authStore.user instead of useAuth() to work with AWS Cognito
    const user = authStore.user

    // Fetch favorites when user is available (on mount or login)
    useEffect(() => {
        if (user?.id) {

            // Always fetch to ensure we have the latest data
            favoritesStore.fetchFavorites(user.id)
        } else {
            favoritesStore.clearLocalFavorites()
        }
    }, [user?.id]) // Re-run when user.id changes (login/logout/page load)

    // This component doesn't render anything
    return null
}
