import { z } from 'zod';

import { endpoints } from './endpoints';
import { getAccessToken } from './auth';
import { ApiError, apiFetch } from './client';

// ----------------------------------------------------------------------
// Admin monitoring (api-contract.md §9) — role-protected on the backend.
// ----------------------------------------------------------------------

function ensureToken(): string {
  const token = getAccessToken();
  if (!token) throw new ApiError(0, 'Belum masuk. Silakan login terlebih dahulu.');
  return token;
}

export const questionReportSchema = z.object({
  id: z.string(),
  questionId: z.string(),
  reason: z.string(),
  note: z.string().nullable().optional(),
  status: z.string(),
  adminNote: z.string().nullable().optional(),
  createdAt: z.string(),
});

export type QuestionReport = z.infer<typeof questionReportSchema>;

export async function listQuestionReports(status?: string): Promise<QuestionReport[]> {
  const { data } = await apiFetch<unknown>(endpoints.admin.questionReports, {
    params: status ? { status } : {},
    headers: { Authorization: `Bearer ${ensureToken()}` },
    next: { revalidate: 0 },
  });
  return z.array(questionReportSchema).parse(data);
}

export async function updateQuestionReport(
  id: string,
  status: 'open' | 'reviewed' | 'dismissed',
  adminNote?: string
): Promise<void> {
  await apiFetch<unknown>(endpoints.admin.questionReport(id), {
    method: 'patch',
    headers: { Authorization: `Bearer ${ensureToken()}` },
    body: { status, adminNote },
  });
}

export const aiGenerationSchema = z.object({
  id: z.string(),
  userId: z.string().nullable().optional(),
  sessionId: z.string().nullable().optional(),
  provider: z.string(),
  model: z.string(),
  promptVersion: z.string(),
  status: z.string(),
  errorCode: z.string().nullable().optional(),
  latencyMs: z.number().nullable().optional(),
  questionCount: z.number().nullable().optional(),
  createdAt: z.string(),
});

export type AIGeneration = z.infer<typeof aiGenerationSchema>;

export async function listAIGenerations(status?: string): Promise<AIGeneration[]> {
  const { data } = await apiFetch<unknown>(endpoints.admin.aiGenerations, {
    params: status ? { status } : {},
    headers: { Authorization: `Bearer ${ensureToken()}` },
    next: { revalidate: 0 },
  });
  return z.array(aiGenerationSchema).parse(data);
}

// ----------------------------------------------------------------------
// Admin: plans, payments (transaksi), dan kurikulum.
// ----------------------------------------------------------------------

export const adminPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  currency: z.string(),
  amount: z.number(),
  quota: z.number(),
  period: z.string(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean(),
});

export type AdminPlan = z.infer<typeof adminPlanSchema>;

export async function listAdminPlans(): Promise<AdminPlan[]> {
  const { data } = await apiFetch<unknown>(endpoints.admin.plans, {
    headers: { Authorization: `Bearer ${ensureToken()}` },
    next: { revalidate: 0 },
  });
  return z.array(adminPlanSchema).parse(data);
}

export async function createAdminPlan(payload: {
  slug: string;
  name: string;
  description?: string;
  currency?: string;
  amount?: number;
  quota?: number;
  period?: string;
  features?: string[];
}): Promise<{ id: string }> {
  const { data } = await apiFetch<unknown>(endpoints.admin.plans, {
    method: 'post',
    headers: { Authorization: `Bearer ${ensureToken()}` },
    body: payload,
  });
  return z.object({ id: z.string() }).parse(data);
}

export async function updateAdminPlan(
  id: string,
  payload: {
    name?: string;
    description?: string;
    quota?: number;
    isActive?: boolean;
    features?: string[];
  }
): Promise<void> {
  await apiFetch<unknown>(endpoints.admin.plan(id), {
    method: 'patch',
    headers: { Authorization: `Bearer ${ensureToken()}` },
    body: payload,
  });
}

export const adminPaymentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  planName: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.string(),
  provider: z.string(),
  paidAt: z.string().nullable().optional(),
  createdAt: z.string(),
});

export type AdminPayment = z.infer<typeof adminPaymentSchema>;

export async function listAdminPayments(status?: string): Promise<AdminPayment[]> {
  const { data } = await apiFetch<unknown>(endpoints.admin.payments, {
    params: status ? { status } : {},
    headers: { Authorization: `Bearer ${ensureToken()}` },
    next: { revalidate: 0 },
  });
  return z.array(adminPaymentSchema).parse(data);
}

export const adminLevelSchema = z.object({ id: z.string(), code: z.string(), name: z.string() });
export const adminGradeSchema = z.object({
  id: z.string(),
  number: z.number(),
  name: z.string(),
  levelName: z.string(),
});
export const adminSubjectSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean(),
});
export const adminTopicSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  subjectName: z.string(),
});

export type AdminSubject = z.infer<typeof adminSubjectSchema>;

export async function listAdminLevels(): Promise<z.infer<typeof adminLevelSchema>[]> {
  const { data } = await apiFetch<unknown>(endpoints.admin.levels, {
    headers: { Authorization: `Bearer ${ensureToken()}` },
  });
  return z.array(adminLevelSchema).parse(data);
}

export async function listAdminGrades(): Promise<z.infer<typeof adminGradeSchema>[]> {
  const { data } = await apiFetch<unknown>(endpoints.admin.grades, {
    headers: { Authorization: `Bearer ${ensureToken()}` },
  });
  return z.array(adminGradeSchema).parse(data);
}

export async function listAdminSubjects(): Promise<AdminSubject[]> {
  const { data } = await apiFetch<unknown>(endpoints.admin.subjects, {
    headers: { Authorization: `Bearer ${ensureToken()}` },
  });
  return z.array(adminSubjectSchema).parse(data);
}

export async function createAdminSubject(payload: {
  slug: string;
  name: string;
  description?: string;
}): Promise<{ id: string }> {
  const { data } = await apiFetch<unknown>(endpoints.admin.subjects, {
    method: 'post',
    headers: { Authorization: `Bearer ${ensureToken()}` },
    body: payload,
  });
  return z.object({ id: z.string() }).parse(data);
}

export async function listAdminTopics(): Promise<z.infer<typeof adminTopicSchema>[]> {
  const { data } = await apiFetch<unknown>(endpoints.admin.topics, {
    headers: { Authorization: `Bearer ${ensureToken()}` },
  });
  return z.array(adminTopicSchema).parse(data);
}
