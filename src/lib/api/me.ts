import { z } from 'zod';

import { endpoints } from './endpoints';
import { getAccessToken } from './auth';
import { ApiError, apiFetch } from './client';

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
  weeklyCompleted: z.number().optional(),
  achievements: nullableList(
    z.object({ code: z.string(), name: z.string(), description: z.string(), earned: z.boolean() })
  ),
  recentSessions: nullableList(recentSessionSchema),
  weakTopics: nullableList(
    z.object({ topicId: z.string(), topicName: z.string(), score: z.number() })
  ),
  recommendations: nullableList(z.object({ topicId: z.string(), reason: z.string() })),
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

export const subjectProgressItemSchema = z.object({
  subjectId: z.string(),
  subjectName: z.string(),
  total: z.number(),
  correct: z.number(),
  percentage: z.number(),
  topics: nullableList(
    z.object({
      topicId: z.string(),
      topicName: z.string(),
      total: z.number(),
      correct: z.number(),
      percentage: z.number(),
    })
  ),
});

export type SubjectProgressItem = z.infer<typeof subjectProgressItemSchema>;

export async function getProgress(): Promise<SubjectProgressItem[]> {
  const { data } = await apiFetch<unknown>(endpoints.me.progress, {
    headers: { Authorization: `Bearer ${ensureToken()}` },
    next: { revalidate: 0 },
  });
  return z.array(subjectProgressItemSchema).parse(data);
}

export const updateMeSchema = z.object({
  name: z.string().min(2).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  educationLevelId: z.string().optional(),
  gradeId: z.string().optional(),
  timezone: z.string().optional(),
});

export type UpdateMeRequest = z.infer<typeof updateMeSchema>;

export const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string().optional(),
  emailVerified: z.boolean().optional(),
  avatarUrl: z.string().nullable().optional(),
  educationLevelId: z.string().nullable().optional(),
  gradeId: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
});

export type Profile = z.infer<typeof profileSchema>;

export async function updateMe(payload: UpdateMeRequest): Promise<Profile> {
  const { data } = await apiFetch<unknown>(endpoints.me.update, {
    method: 'patch',
    headers: { Authorization: `Bearer ${ensureToken()}` },
    body: payload,
    next: { revalidate: 0 },
  });
  return profileSchema.parse(data);
}
