export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  KAKAO_REST_API_KEY: process.env.KAKAO_REST_API_KEY ?? "",
  HIRA_API_KEY: process.env.HIRA_API_KEY ?? "",
  NEXT_PUBLIC_KAKAO_MAP_KEY: process.env.NEXT_PUBLIC_KAKAO_MAP_KEY ?? "",
  NEXT_PUBLIC_APP_URL:
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;
