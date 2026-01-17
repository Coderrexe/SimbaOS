export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tasks/:path*",
    "/goals/:path*",
    "/habits/:path*",
    "/metrics/:path*",
    "/review/:path*",
  ],
};
