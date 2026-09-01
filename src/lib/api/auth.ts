import { z } from 'zod';

import { apiFetch } from './client';
import { endpoints } from './endpoints';

// ----------------------------------------------------------------------
// Schemas — mirror api-contract.md §4 (auth).
// ----------------------------------------------------------------------

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string().optional(),
  emailVerified: z.boolean().optional(),
});

export type User = z.infer<typeof userSchema>;

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  tokenType: z.string().optional(),
  expiresIn: z.number().optional(),
  user: userSchema,
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

const pendingRegistrationSchema = z.object({
  requiresEmailVerification: z.literal(true),
  user: userSchema,
});

export type RegisterResponse = LoginResponse | z.infer<typeof pendingRegistrationSchema>;

export const registerRequestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  acceptedTermsVersion: z.string(),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

// ----------------------------------------------------------------------
// Client-side auth state token storage. Access token is kept in memory
// only (not persisted) to avoid XSS-risk persistence; refresh via cookie.
// ----------------------------------------------------------------------

// Simple in-memory token holder. In a fuller implementation this ties into
// an httpOnly refresh cookie + a coordinated refresh-on-401 interceptor.
let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

// ----------------------------------------------------------------------
// Fetchers
// ----------------------------------------------------------------------

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await apiFetch<unknown>(endpoints.auth.login, {
    method: 'post',
    body: { email, password },
  });
  const parsed = loginResponseSchema.parse(data);
  setAccessToken(parsed.accessToken);
  return parsed;
}

export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  const { data } = await apiFetch<unknown>(endpoints.auth.register, {
    method: 'post',
    body: payload,
  });
  const parsed = z.union([loginResponseSchema, pendingRegistrationSchema]).parse(data);
  if ('accessToken' in parsed) setAccessToken(parsed.accessToken);
  return parsed;
}

export function refreshSession(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = apiFetch<unknown>(endpoints.auth.refresh, { method: 'post' })
      .then(({ data }) => {
        const parsed = z.object({ accessToken: z.string() }).parse(data);
        setAccessToken(parsed.accessToken);
        return parsed.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function logout() {
  await apiFetch<unknown>(endpoints.auth.logout, {
    method: 'post',
  });
  setAccessToken(null);
}

export async function fetchMe(signal?: AbortSignal): Promise<User | null> {
  const token = getAccessToken();
  if (!token) return null;

  const { data } = await apiFetch<unknown>(endpoints.auth.me, {
    signal,
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
  });
  return userSchema.parse(data);
}

// ----------------------------------------------------------------------
// Email lifecycle & password reset (api-contract.md §4).
// ----------------------------------------------------------------------

export async function requestEmailVerification(email: string): Promise<void> {
  await apiFetch<unknown>(endpoints.auth.requestEmailVerification, {
    method: 'post',
    body: { email },
  });
}

export async function confirmEmailVerification(token: string): Promise<void> {
  await apiFetch<unknown>(endpoints.auth.confirmEmailVerification, {
    method: 'post',
    body: { token },
  });
}

export async function forgotPassword(email: string): Promise<void> {
  await apiFetch<unknown>(endpoints.auth.forgotPassword, {
    method: 'post',
    body: { email },
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiFetch<unknown>(endpoints.auth.resetPassword, {
    method: 'post',
    body: { token, newPassword },
  });
}
