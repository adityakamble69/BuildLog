import { auth } from "@clerk/nextjs/server";

/**
 * Returns the authenticated Clerk user ID, or null when signed out.
 *
 * Per docs/rules.md: never trust a browser-supplied user ID as proof of
 * ownership — always derive identity from the server-side Clerk session.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Returns the authenticated Clerk user ID or throws.
 * Use in Server Actions / Route Handlers that require an authenticated user.
 */
export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("UNAUTHENTICATED");
  }
  return userId;
}
