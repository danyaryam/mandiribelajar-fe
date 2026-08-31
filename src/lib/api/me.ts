import { z } from 'zod';

import { endpoints } from './endpoints';
import { ApiError } from './client';
import { apiFetch } from './client';
import { getAccessToken } from './auth';

// ----------------------------------------------------------------------
// Schemas — mirror api-contract.md §5 (current user, dashboard, usage).
// ----------------------------------------------------------------------

const nullableList = <T extends z.ZodTypeAny>(item: T) =>
  z
    .array(item)
    .nullish()
    .transform((value) => value ?? []);

export const recentSessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  score: z.number().nullable().optional(),
  maxScore: z.number().nullable().optional(),
  createdAt: z.string(),
});

export const dashboardSchema = z.object({
  averageScore: z.number().nullable().optional(),
  completedSessions: z.number(),
  currentStreakDays: z.number(),
  weeklyGoal: z.number().nullable().optional(),
  recentSessions: nullableList(recentSessionSchema),
  weakTopics: nullableList(z.object({ topicId: z.string(), topicName: z.string(), score: z.number() })),
  usageSummary: z.object({
    totalConsumed: z.number(),
    balance: z.number(),
  }),
});

export type Dashboard = z.infer<typeof dashboardSchema>;

export const usageRowSchema = z.object({
  type: z.string(),
  amount: z.number(),
  balanceAfter: z.number(),
  resourceId: z.string().nullable().optional(),
  createdAt: z.string(),
});

export type UsageRow = z.infer<typeof usageRowSchema>;

// ----------------------------------------------------------------------

function ensureToken(): string {
  const token = getAccessToken();
  if (!token) throw new ApiError(0, 'Belum masuk. Silakan login terlebih dahulu.');
  return token;
}

export async function getDashboard(): Promise<Dashboard> {
  const { data } = await apiFetch<unknown>(endpoints.me.dashboard, {
    headers: { Authorization: `Bearer ${ensureToken()}` },
    next: { revalidate: 0 },
  });
  return dashboardSchema.parse(data);
}

export async function getUsage(): Promise<UsageRow[]> {
  const { data } = await apiFetch<unknown>(endpoints.me.usage, {
    headers: { Authorization: `Bearer ${ensureToken()}` },
    next: { revalidate: 0 },
  });
  return nullableList(usageRowSchema).parse(data);
}
