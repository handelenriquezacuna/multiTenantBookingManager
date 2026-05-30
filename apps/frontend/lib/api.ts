import { frontendConfig } from "@/lib/frontend-config";

const API_BASE_URL = frontendConfig.apiBaseUrl;
const API_MODE = frontendConfig.apiMode;

export function isMockMode() {
  return API_MODE !== "api";
}

export async function apiGet<T>(path: string): Promise<T> {
  if (isMockMode()) {
    throw new Error("API disabled in mock mode");
  }
  const response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}
