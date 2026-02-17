// Global API Base URL
const DEFAULT_API_BASE_URL = "http://193.203.161.174:3007";

const envBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

// Helper to determine if we are on server
const isServer = typeof window === 'undefined';

// Determine the actual base URL
let resolvedBaseUrl = envBaseUrl;

// If we are on the server and the base URL is relative (e.g. starts with /), 
// fallback to the default absolute URL to verify 'Failed to parse URL' errors in fetch.
if (isServer && resolvedBaseUrl.startsWith('/')) {
  resolvedBaseUrl = DEFAULT_API_BASE_URL;
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
