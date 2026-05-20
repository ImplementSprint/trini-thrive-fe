/**
 * Get backend URL from environment or default to localhost:5000
 */
export async function getBackendUrl(): Promise<string> {
  const url = process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL ?? '';
  console.log(`🔍 Backend URL: ${url}`);
  return url;
}

/**
 * Cache the backend URL to avoid repeated lookups
 */
let cachedBackendUrl: string | null = null;

export async function getBackendUrlCached(): Promise<string> {
  if (cachedBackendUrl) {
    return cachedBackendUrl;
  }
  cachedBackendUrl = await getBackendUrl();
  return cachedBackendUrl;
}

/**
 * Clear the cache (useful for testing)
 */
export function clearBackendUrlCache(): void {
  cachedBackendUrl = null;
}
