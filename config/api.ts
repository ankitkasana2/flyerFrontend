// Global API Base URL
const DEFAULT_API_BASE_URL = "http://193.203.161.174:3007";

const envBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

// Helper to determine if we are on server
const isServer = typeof window === 'undefined' || (typeof process !== 'undefined' && process.release?.name === 'node');

// Determine the actual base URL
let resolvedBaseUrl = envBaseUrl;

// If we are on the server and the base URL is relative (e.g. starts with /) OR empty, 
// we must resolve it to an absolute URL for Node.js fetch.
if (isServer && (resolvedBaseUrl.startsWith('/') || !resolvedBaseUrl)) {
  // Priority:
  // 1. BACKEND_API_BASE_URL (specific for server-side backend connection)
  // 2. API_BASE_URL (server-side override)
  // 3. DEFAULT_API_BASE_URL (fallback to hardcoded IP/Domain)
  const overrideUrl = process.env.BACKEND_API_BASE_URL || process.env.API_BASE_URL;
  resolvedBaseUrl = overrideUrl || DEFAULT_API_BASE_URL;
}

export const API_BASE_URL = resolvedBaseUrl.replace(/\/$/, "");

/**
 * Returns a fully qualified API URL.
 * Safely handles deduplication of '/api' if it's already in the base URL.
 */
export const getApiUrl = (path = ""): string => {
  if (!path) return API_BASE_URL;

  let cleanPath = path.startsWith("/") ? path : `/${path}`;

  // If base ends with /api and path starts with /api, remove it from path
  if (API_BASE_URL.endsWith("/api") && cleanPath.startsWith("/api/")) {
    cleanPath = cleanPath.substring(4);
  }

  return `${API_BASE_URL}${cleanPath}`;
};
