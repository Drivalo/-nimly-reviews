import { cookies } from "next/headers";

const AUTH_COOKIE = "nimly_auth";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value === "true";
}

export function getAuthCookieOptions() {
  return {
    name: AUTH_COOKIE,
    value: "true",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  };
}

export async function requireAuth(): Promise<boolean> {
  return isAuthenticated();
}
