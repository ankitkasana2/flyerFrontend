import { API_BASE_URL, getApiUrl } from "@/config/api"

const LOCAL_TEMP_PATH = "/api/serve-temp"
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "")

function buildUploadsUrl(pathWithQuery: string): string {
    if (!pathWithQuery) return pathWithQuery
    if (pathWithQuery.startsWith("/uploads/")) {
        return `${API_ORIGIN}${pathWithQuery}`
    }
    return getApiUrl(pathWithQuery)
}

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
                return buildUploadsUrl(pathWithQuery)
            }
        } catch {
            return raw
        }
        return raw
    }

    if (raw.startsWith("/uploads/") || raw.startsWith("/api/uploads/")) {
        return buildUploadsUrl(raw)
    }

    if (raw.startsWith("/")) {
        return raw
    }

    return getApiUrl(`/${raw}`)
}
