import crypto from "node:crypto";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getGitHubOAuthConfig } from "@/lib/github/service";

const OAUTH_COOKIE = "devtrace_github_oauth";
const OAUTH_EXPIRY_SECONDS = 10 * 60;

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  let config: { clientId: string };
  try {
    config = getGitHubOAuthConfig();
  } catch {
    return redirectToSettings(request, "configuration_error");
  }

  const state = crypto.randomBytes(32).toString("base64url");
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const callbackUrl = new URL("/api/github/callback", request.url).toString();
  const authorizationUrl = new URL("https://github.com/login/oauth/authorize");
  authorizationUrl.search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: callbackUrl,
    // Classic OAuth apps require `repo` to read commits from private repos.
    // It is requested only after the user actively chooses Connect GitHub.
    scope: "read:user repo",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  }).toString();

  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set(OAUTH_COOKIE, encodeOAuthCookie({ userId, state, codeVerifier }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: OAUTH_EXPIRY_SECONDS,
    path: "/api/github/callback",
  });
  return response;
}

function encodeOAuthCookie(value: {
  userId: string;
  state: string;
  codeVerifier: string;
}): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function redirectToSettings(request: Request, github: string): NextResponse {
  const url = new URL("/dashboard/settings", request.url);
  url.searchParams.set("github", github);
  return NextResponse.redirect(url);
}
