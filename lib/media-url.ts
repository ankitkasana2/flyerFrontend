import { getApiUrl } from "@/config/api"

const LOCAL_TEMP_PATH = "/api/serve-temp"

export function resolveMediaUrl(url: string | null | undefined): string | null {
    if (!url) return null

    const raw = String(url).trim()
    if (!raw) return null

    if (raw.startsWith("data:") || raw.startsWith("blob:")) return raw
    if (raw.startsWith(LOCAL_TEMP_PATH)) return raw

    if (raw.startsWith("http://") || raw.startsWith("https://")) {
        try {
            const parsed = new URL(raw)
            const pathWithQuery = `${parsed.pathname}${parsed.search}${parsed.hash}`

            if (parsed.pathname.startsWith(LOCAL_TEMP_PATH)) return raw

            if (parsed.pathname.startsWith("/uploads/") || parsed.pathname.startsWith("/api/uploads/")) {
                return getApiUrl(pathWithQuery)
            }
        } catch {
            return raw
        }
        return raw
    }

    if (raw.startsWith("/uploads/") || raw.startsWith("/api/uploads/")) {
        return getApiUrl(raw)
    }

    if (raw.startsWith("/")) {
        return raw
    }

    return getApiUrl(`/${raw}`)
}
