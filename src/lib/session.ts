import { cookies } from "next/headers";
import type { Session } from "@/types";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:4000";

// Server-side session check for the dashboard layout guard. Server
// Components don't automatically forward the browser's cookies on outbound
// fetch()es, so the incoming request's cookie header is read via
// next/headers and re-attached explicitly.
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (!cookieHeader) {
    return null;
  }

  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }
  return res.json() as Promise<Session>;
}
