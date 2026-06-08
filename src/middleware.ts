export { default } from "next-auth/middleware";

// Protect all dashboard routes; unauthenticated users are redirected to /login.
export const config = {
  matcher: ["/dashboard/:path*"],
};
