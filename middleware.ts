import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/Dashboard_desktopView/LightMode/clients",
  "/Dashboard_desktopView/LightMode/events",
  "/Dashboard_desktopView/LightMode/gallery",
  "/Dashboard_desktopView/LightMode/projects",
  "/Dashboard_desktopView/DarkMode/clients",
  "/Dashboard_desktopView/DarkMode/events",
  "/Dashboard_desktopView/DarkMode/gallery",
  "/Dashboard_desktopView/DarkMode/projects",
  "/Dashboard_mobileView/LightMode/clients",
  "/Dashboard_mobileView/LightMode/events",
  "/Dashboard_mobileView/LightMode/gallery",
  "/Dashboard_mobileView/LightMode/projects",
  "/Dashboard_mobileView/DarkMode/clients",
  "/Dashboard_mobileView/DarkMode/events",
  "/Dashboard_mobileView/DarkMode/gallery",
  "/Dashboard_mobileView/DarkMode/projects",
  "/",
]);
const isAdminRoute = createRouteMatcher([
  "/Dashboard_desktopView/LightMode/clients",
  "/Dashboard_desktopView/LightMode/events",
  "/Dashboard_desktopView/LightMode/gallery",
  "/Dashboard_desktopView/LightMode/projects",
  "/Dashboard_desktopView/DarkMode/clients",
  "/Dashboard_desktopView/DarkMode/events",
  "/Dashboard_desktopView/DarkMode/gallery",
  "/Dashboard_desktopView/DarkMode/projects",
  "/Dashboard_mobileView/LightMode/clients",
  "/Dashboard_mobileView/LightMode/events",
  "/Dashboard_mobileView/LightMode/gallery",
  "/Dashboard_mobileView/LightMode/projects",
  "/Dashboard_mobileView/DarkMode/clients",
  "/Dashboard_mobileView/DarkMode/events",
  "/Dashboard_mobileView/DarkMode/gallery",
  "/Dashboard_mobileView/DarkMode/projects",
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
