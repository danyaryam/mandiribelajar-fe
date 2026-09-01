import { z } from 'zod';

import { endpoints } from './endpoints';
import { getAccessToken } from './auth';
import { ApiError, apiFetch } from './client';

// ----------------------------------------------------------------------
// Schemas — mirror api-contract.md §8 (plans, pays, usage).
// ----------------------------------------------------------------------

const nullableList = <T extends z.ZodTypeAny>(item: T) =>
  z
    .array(item)
    .nullish()
    .transform((value) => value ?? []);

export const planSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  currency: z.string(),
  amount: z.number(),
  quota: z.number(),
  period: z.string(),
  features: nullableList(z.string()),
});

export type Plan = z.infer<typeof planSchema>;

export const checkoutResponseSchema = z.object({
  paymentId: z.string(),
  status: z.string(),
  checkoutUrl: z.string(),
  expiresAt: z.string(),
});

export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>;

export const paymentSchema = z.object({
  id: z.string(),
  status: z.string(),
  amount: z.number(),
  currency: z.string(),
  provider: z.string(),
  providerReference: z.string().optional(),
  planName: z.string().optional(),
  createdAt: z.string(),
});

export type Payment = z.infer<typeof paymentSchema>;

// ----------------------------------------------------------------------

function ensureToken(): string {
  const token = getAccessToken();
  if (!token) throw new ApiError(0, 'Belum masuk. Silakan login terlebih dahulu.');
  return token;
}

export async function getPlans(): Promise<Plan[]> {
  const { data } = await apiFetch<unknown>(endpoints.billing.plans, {
    next: { revalidate: 300 },
  });
  return nullableList(planSchema).parse(data);
}

export async function checkout(planId: string): Promise<CheckoutResponse> {
  const { data } = await apiFetch<unknown>(endpoints.billing.checkout, {
    method: 'post',
    headers: {
      Authorization: `Bearer ${ensureToken()}`,
      'Idempotency-Key': cryptoRandomUUID(),
    },
    body: { planId },
  });
  return checkoutResponseSchema.parse(data);
}

export async function getPayments(): Promise<Payment[]> {
  const { data } = await apiFetch<unknown>(endpoints.billing.payments, {
    headers: { Authorization: `Bearer ${ensureToken()}` },
  });
  return nullableList(paymentSchema).parse(data);
}

export const paymentDetailSchema = z.object({
  id: z.string(),
  status: z.string(),
  amount: z.number(),
  currency: z.string(),
  provider: z.string(),
  providerReference: z.string().optional(),
  plan: z.object({ id: z.string(), name: z.string() }).nullable().optional(),
  createdAt: z.string(),
  paidAt: z.string().nullable().optional(),
});

export type PaymentDetail = z.infer<typeof paymentDetailSchema>;

export async function getPayment(paymentId: string): Promise<PaymentDetail> {
  const { data } = await apiFetch<unknown>(endpoints.billing.paymentDetails(paymentId), {
    headers: { Authorization: `Bearer ${ensureToken()}` },
  });
  return paymentDetailSchema.parse(data);
}

function cryptoRandomUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
