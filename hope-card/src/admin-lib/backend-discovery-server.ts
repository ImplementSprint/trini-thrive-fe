import * as fs from "fs";
import * as path from "path";

interface BackendInfo {
  port: number;
  url: string;
  timestamp: string;
}

const BACKEND_CONFIG_FILE = "backend-info.json";
const DEBUG = process.env.NODE_ENV === "development";

/**
 * Server-side backend URL discovery
 * Reads from backend-info.json file created by the backend on startup.
 * Falls back to environment variable, then default localhost:5000.
 */
export async function getBackendUrlServer(): Promise<string> {
  try {
    const publicPath = path.join(process.cwd(), "public", BACKEND_CONFIG_FILE);
    
    if (fs.existsSync(publicPath)) {
      const data = fs.readFileSync(publicPath, "utf-8");
      const config: BackendInfo = JSON.parse(data);
      const url = config.url;
      
      if (DEBUG) {
        console.log(`[Backend Discovery] Found config file: ${url}`);
      }
      return url;
    }
  } catch (error) {
    if (DEBUG) {
      console.warn(`[Backend Discovery] Config file read error:`, error instanceof Error ? error.message : error);
    }
  }

  // Fall back to environment variable
  const envUrl = process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL;
  if (envUrl) {
    if (DEBUG) {
      console.log(`[Backend Discovery] Using env variable: ${envUrl}`);
    }
    return envUrl;
  }

  // Final fallback
  const defaultUrl = "http://127.0.0.1:3011";
  if (DEBUG) {
    console.log(`[Backend Discovery] Using default: ${defaultUrl}`);
  }
  return defaultUrl;
}

/**
 * Cache for the backend URL to avoid repeated file reads
 */
let cachedBackendUrlServer: string | null = null;

/**
 * Get backend URL with caching
 */
export async function getBackendUrlServerCached(): Promise<string> {
  if (cachedBackendUrlServer) {
    return cachedBackendUrlServer;
  }
  cachedBackendUrlServer = await getBackendUrlServer();
  return cachedBackendUrlServer;
}

/**
 * Clear the cache (useful for testing/refreshing)
 */
export function clearBackendUrlServerCache(): void {
  cachedBackendUrlServer = null;
}
