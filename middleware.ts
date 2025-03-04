import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/Dashboard_desktopView/clients",
  "/Dashboard_desktopView/events",
  "/Dashboard_desktopView/news",
  "/Dashboard_desktopView/users",
  "/",
]);
const isAdminRoute = createRouteMatcher([
  "/Dashboard_desktopView/clients",
  "/Dashboard_desktopView/events",
  "/Dashboard_desktopView/news",
  "/Dashboard_desktopView/users",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();

    if (
      isAdminRoute(req) &&
      (await auth()).sessionClaims?.metadata?.role !== "lens_admin"
    ) {
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
