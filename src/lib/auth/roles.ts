import { NextRequest } from "next/server";
import crypto from "crypto";

export const DEFAULT_DEV_ADMIN_KEY = "ewaste-admin-secret-dev-2026";

/**
 * Returns the configured admin secret key.
 *
 * Strict Production Security Rules:
 * 1. In production ('production' NODE_ENV), ADMIN_API_KEY MUST be set and non-empty.
 * 2. In production, the hardcoded development fallback key is strictly prohibited and returns null.
 * 3. In production, trivial or weak keys (< 16 characters) return null to prevent brute-force attacks.
 * 4. In development and test environments, falls back to DEFAULT_DEV_ADMIN_KEY for seamless offline testing.
 */
export function getAdminKey(): string | null {
  const isProd = process.env.NODE_ENV === "production";
  const configuredKey = process.env.ADMIN_API_KEY?.trim();

  if (isProd) {
    if (!configuredKey) {
      return null;
    }
    if (configuredKey === DEFAULT_DEV_ADMIN_KEY) {
      // Insecure development key prohibited in production
      return null;
    }
    if (configuredKey.length < 16) {
      // Reject trivially weak keys in production
      return null;
    }
    return configuredKey;
  }

  return configuredKey || DEFAULT_DEV_ADMIN_KEY;
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Checks whether the incoming request is authorized as an administrator.
 * Examines:
 *  1. Header: 'x-admin-key'
 *  2. Cookie: 'admin_token'
 *
 * Fails closed (returns false) if no secure admin key is configured.
 * NEVER trusts query params or unauthenticated client role claims.
 */
export function isRequestAdmin(request: NextRequest): boolean {
  const adminKey = getAdminKey();
  if (!adminKey) {
    return false;
  }

  const headerKey = request.headers.get("x-admin-key")?.trim();
  if (headerKey && timingSafeEqual(headerKey, adminKey)) {
    return true;
  }

  const cookieKey = request.cookies.get("admin_token")?.value?.trim();
  if (cookieKey && timingSafeEqual(cookieKey, adminKey)) {
    return true;
  }

  return false;
}

/**
 * Gets or extracts the user session identifier from headers, cookies, or generates one.
 */
export function getSessionIdentifier(request: NextRequest): string {
  const headerSession = request.headers.get("x-session-id");
  if (headerSession && headerSession.trim().length > 0) {
    return headerSession.trim();
  }

  const cookieSession = request.cookies.get("ew_session_id")?.value;
  if (cookieSession && cookieSession.trim().length > 0) {
    return cookieSession.trim();
  }

  return "anonymous-session";
}
