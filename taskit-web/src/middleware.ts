import { middlewareResponse } from "revine";
import type { MiddlewareFn } from "revine";

// Define which paths are public (no auth needed)
const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];
// Define auth-only paths (logged-in users can't visit these)
const AUTH_PATHS = ["/login", "/register"];

export default (async ({ pathname }) => {
  const token = localStorage.getItem("auth_token");
  const isLoggedIn = !!token;

  // Auth pages: redirect logged-in users away
  if (AUTH_PATHS.some(p => pathname.startsWith(p))) {
    if (isLoggedIn) return middlewareResponse.redirect("/");
    return middlewareResponse.next();
  }

  // Private pages: redirect guests to login
  if (!PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    if (!isLoggedIn) return middlewareResponse.redirect("/login");
  }

  return middlewareResponse.next();
}) satisfies MiddlewareFn;