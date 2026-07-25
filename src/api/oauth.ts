import { OAuth, getPreferenceValues } from "@raycast/api";
import fetch from "node-fetch";

export interface Preferences {
  baseUrl?: string;
  apiKey?: string;
}

export const oauthClient = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.Web,
  providerName: "Coach Watts",
  providerIcon: "command-icon.png",
  providerId: "coach-watts",
  description: "Connect your Coach Watts account",
});

export function getBaseUrl(): string {
  const prefs = getPreferenceValues<Preferences>();
  let url = prefs.baseUrl?.trim() || "https://coachwatts.com";
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  return url;
}

export function getWebUrl(path = ""): string {
  const baseUrl = getBaseUrl();
  if (!path) return baseUrl;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

export async function getAuthHeader(): Promise<Record<string, string>> {
  const prefs = getPreferenceValues<Preferences>();

  // 1. If API Key preference is provided, use it directly
  if (prefs.apiKey && prefs.apiKey.trim().length > 0) {
    const key = prefs.apiKey.trim();
    return {
      "X-API-Key": key,
      Authorization: `Bearer ${key}`,
    };
  }

  // 2. Otherwise, use OAuth PKCE
  const tokenSet = await oauthClient.getTokens();

  if (tokenSet?.accessToken) {
    if (tokenSet.isExpired()) {
      if (tokenSet.refreshToken) {
        try {
          const newTokens = await refreshOAuthToken(tokenSet.refreshToken);
          await oauthClient.setTokens(newTokens);
          return { Authorization: `Bearer ${newTokens.access_token}` };
        } catch {
          // If refresh fails, fall through to re-authorize
          await oauthClient.removeTokens();
        }
      }
    } else {
      return { Authorization: `Bearer ${tokenSet.accessToken}` };
    }
  }

  // Start fresh OAuth Authorization flow
  const baseUrl = getBaseUrl();
  const authRequest = await oauthClient.authorizationRequest({
    endpoint: `${baseUrl}/oauth/authorize`,
    clientId: "coach-watts-raycast",
    scope:
      "workout:read health:read recommendation:read chat:read chat:write offline_access",
  });

  const { authorizationCode } = await oauthClient.authorize(authRequest);
  const tokenResponse = await fetchOAuthToken(authRequest, authorizationCode);
  await oauthClient.setTokens(tokenResponse);

  return { Authorization: `Bearer ${tokenResponse.access_token}` };
}

async function fetchOAuthToken(
  authRequest: OAuth.AuthorizationRequest,
  authorizationCode: string,
): Promise<OAuth.TokenResponse> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: "coach-watts-raycast",
      code: authorizationCode,
      redirect_uri: authRequest.redirectURI,
      code_verifier: authRequest.codeVerifier,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `OAuth token exchange failed (${response.status}): ${text}`,
    );
  }

  return (await response.json()) as OAuth.TokenResponse;
}

async function refreshOAuthToken(
  refreshToken: string,
): Promise<OAuth.TokenResponse> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: "coach-watts-raycast",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`OAuth token refresh failed (${response.status}): ${text}`);
  }

  return (await response.json()) as OAuth.TokenResponse;
}
