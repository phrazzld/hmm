import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Only protect specific routes that require authentication
// Home (/) and search (/search) are public - users can view without signing in
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/settings(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Only enforce auth on protected routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  // All other routes are public (/, /search, /sign-in, /sign-up)
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
