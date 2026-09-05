import crypto from "node:crypto";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  getGitHubOAuthConfig,
  getGitHubUser,
  saveGitHubConnection,
} from "@/lib/github/service";

const OAUTH_COOKIE = "devtrace_github_oauth";

interface OAuthCookie {
  userId: string;
  state: string;
  codeVerifier: string;
}

interface GitHubTokenResponse {
  access_token?: unknown;
  scope?: unknown;
}

export async function GET(request: Request) {
  const { userId } = await auth();
  const callbackUrl = new URL(request.url);
  const response = redirectToSettings(request, "connection_failed");
  response.cookies.delete({ name: OAUTH_COOKIE, path: "/api/github/callback" });

  if (!userId) return redirectToSettings(request, "authentication_required");

  if (callbackUrl.searchParams.get("error")) {
    return redirectToSettings(request, "access_denied");
  }

  const code = callbackUrl.searchParams.get("code");
  const state = callbackUrl.searchParams.get("state");
  const oauthCookie = readOAuthCookie(request.headers.get("cookie"));
  if (
    !code ||
    !state ||
    !oauthCookie ||
    oauthCookie.userId !== userId ||
    !safeEqual(state, oauthCookie.state)
  ) {
    return response;
  }

  try {
    const { clientId, clientSecret } = getGitHubOAuthConfig();
    const redirectUri = new URL("/api/github/callback", request.url).toString();
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        code_verifier: oauthCookie.codeVerifier,
      }),
      cache: "no-store",
    });

    if (!tokenResponse.ok) return response;
    const tokenPayload = (await tokenResponse.json()) as GitHubTokenResponse;
    if (typeof tokenPayload.access_token !== "string" || !tokenPayload.access_token) {
      return response;
    }

    // GitHub recommends revalidating the account attached to every new token
    // before storing it, avoiding accidental account/token mix-ups.
    const githubUser = await getGitHubUser(tokenPayload.access_token);
    await saveGitHubConnection({
      userId,
      accessToken: tokenPayload.access_token,
      scopes: typeof tokenPayload.scope === "string" ? tokenPayload.scope : null,
      user: githubUser,
    });

    const success = redirectToSettings(request, "connected");
    success.cookies.delete({ name: OAUTH_COOKIE, path: "/api/github/callback" });
    return success;
  } catch (error) {
    console.error("[app/api/github/callback] GitHub OAuth failed", error);
    return response;
  }
}

function readOAuthCookie(cookieHeader: string | null): OAuthCookie | null {
  const raw = cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${OAUTH_COOKIE}=`))
    ?.slice(OAUTH_COOKIE.length + 1);
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof (parsed as OAuthCookie).userId !== "string" ||
      typeof (parsed as OAuthCookie).state !== "string" ||
      typeof (parsed as OAuthCookie).codeVerifier !== "string"
    ) {
      return null;
    }
    return parsed as OAuthCookie;
  } catch {
    return null;
  }
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function redirectToSettings(request: Request, github: string): NextResponse {
  const url = new URL("/dashboard/settings", request.url);
  url.searchParams.set("github", github);
  return NextResponse.redirect(url);
}
