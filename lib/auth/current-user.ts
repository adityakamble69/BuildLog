import { auth, currentUser } from "@clerk/nextjs/server";

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

/** Minimal display info for greeting/labeling the signed-in user in the UI. */
export interface CurrentUserDisplay {
  id: string;
  firstName: string | null;
  fullName: string | null;
  email: string | null;
  imageUrl: string;
}

/**
 * Returns display-safe info (name/email/avatar) for the authenticated user,
 * or null when signed out. This is for UI presentation only — never use it
 * as an authorization check; use `getCurrentUserId`/`requireUserId` for that.
 */
export async function getCurrentUserDisplay(): Promise<CurrentUserDisplay | null> {
  const user = await currentUser();
  if (!user) return null;

  return {
    id: user.id,
    firstName: user.firstName,
    fullName: user.fullName,
    email: user.primaryEmailAddress?.emailAddress ?? null,
    imageUrl: user.imageUrl,
  };
}
