// Global API Base URL
const DEFAULT_API_BASE_URL = "http://193.203.161.174:3007/api";

const envBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export const API_BASE_URL = envBaseUrl.replace(/\/$/, "");

export const getApiUrl = (path = ""): string => {
  if (!path) return API_BASE_URL;
  // If the path already starts with /api and API_BASE_URL also ends with /api, remove the redundant one
  const cleanPath = (path.startsWith("/api") && API_BASE_URL.endsWith("/api"))
    ? path.replace("/api", "")
    : path;

  return `${API_BASE_URL}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
};
