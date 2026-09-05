import { clerkMiddleware } from "@clerk/nextjs/server";

// Authentication is enforced by the page, route, and Server Function that
// accesses protected data. Keep Clerk's proxy integration enabled so those
// resource-level checks can read the request session.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
