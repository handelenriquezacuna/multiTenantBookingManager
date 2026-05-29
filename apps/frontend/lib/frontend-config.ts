export const frontendConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  apiMode: process.env.NEXT_PUBLIC_API_MODE || "mock"
} as const;
