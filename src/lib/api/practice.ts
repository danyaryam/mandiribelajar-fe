import { z } from 'zod';

import { endpoints } from './endpoints';
import { getAccessToken } from './auth';
import { ApiError , apiFetch } from './client';

// ----------------------------------------------------------------------
// Schemas — mirror api-contract.md §7 (practice/course).
// ----------------------------------------------------------------------

const nullableList = <T extends z.ZodTypeAny>(item: T) =>
  z
    .array(item)
    .nullish()
    .transform((value) => value ?? []);

export const sessionMetaSchema = z.object({
  id: z.string(),
  status: z.string(),
  estimatedQuestionCount: z.number(),
  reservedUsage: z.number(),
  createdAt: z.string(),
});

export type SessionMeta = z.infer<typeof sessionMetaSchema>;

export const sessionStatusSchema = z.object({
  id: z.string(),
  status: z.string(),
  progress: z.object({ current: z.number(), total: z.number() }),
  failureCode: z.string().nullable().optional(),
  retryable: z.boolean().optional(),
});

export type SessionStatus = z.infer<typeof sessionStatusSchema>;

export const questionOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  text: z.string(),
});

export const draftAnswerSchema = z.object({
  selectedOptionId: z.string().optional(),
  text: z.string().optional(),
});

export const sessionQuestionSchema = z.object({
  id: z.string(),
  position: z.number(),
  type: z.string(),
  prompt: z.string(),
  options: nullableList(questionOptionSchema),
  draftAnswer: draftAnswerSchema.nullable().optional(),
});

export type SessionQuestion = z.infer<typeof sessionQuestionSchema>;

export const sessionDetailSchema = z.object({
  id: z.string(),
  status: z.string(),
  title: z.string(),
  difficulty: z.string(),
  questionCount: z.number(),
  startedAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  questions: nullableList(sessionQuestionSchema),
});

export type SessionDetail = z.infer<typeof sessionDetailSchema>;

export const resultAnswerSchema = z.object({
  questionId: z.string(),
  position: z.number(),
  type: z.string(),
  prompt: z.string(),
  userAnswer: draftAnswerSchema.nullable().optional(),
  correctAnswer: draftAnswerSchema.nullable().optional(),
  isCorrect: z.boolean(),
  score: z.number(),
  maxScore: z.number(),
  explanation: z.string().optional().default(''),
  needsReview: z.boolean().optional(),
});

export const resultSchema = z.object({
  sessionId: z.string(),
  score: z.number(),
  maxScore: z.number(),
  correctCount: z.number(),
  incorrectCount: z.number(),
  unansweredCount: z.number(),
  submittedAt: z.string(),
  answers: nullableList(resultAnswerSchema),
  recommendations: nullableList(z.object({ topicId: z.string(), reason: z.string() })),
});

export type PracticeResult = z.infer<typeof resultSchema>;

export type CreateSessionInput = {
  educationLevelId: string;
  gradeId: string;
  subjectId: string;
  topicIds: string[];
  difficulty?: string;
  questionTypes: string[];
  questionCount: number;
  language?: string;
};

// ----------------------------------------------------------------------
// A small per-request Authorization header helper; throws if not logged in.
// ----------------------------------------------------------------------

function ensureToken(): string {
  const token = getAccessToken();
  if (!token) throw new ApiError(0, 'Belum masuk. Silakan login terlebih dahulu.');
  return token;
}

// ----------------------------------------------------------------------
// Fetchers
// ----------------------------------------------------------------------

export async function createPracticeSession(input: CreateSessionInput): Promise<SessionMeta> {
  const { data } = await apiFetch<unknown>(endpoints.practiceSlots.create, {
    method: 'post',
    headers: { Authorization: `Bearer ${ensureToken()}` },
    body: input,
  });
  return sessionMetaSchema.parse(data);
}

export async function getSessionStatus(sessionId: string): Promise<SessionStatus> {
  const { data } = await apiFetch<unknown>(endpoints.practiceSlots.status(sessionId), {
    headers: { Authorization: `Bearer ${ensureToken()}` },
  });
  return sessionStatusSchema.parse(data);
}

export async function startSession(sessionId: string): Promise<void> {
  await apiFetch<unknown>(endpoints.practiceSlots.start(sessionId), {
    method: 'post',
    headers: { Authorization: `Bearer ${ensureToken()}` },
  });
}

export async function getSession(sessionId: string): Promise<SessionDetail> {
  const { data } = await apiFetch<unknown>(endpoints.practiceSlots.detail(sessionId), {
    headers: { Authorization: `Bearer ${ensureToken()}` },
  });
  return sessionDetailSchema.parse(data);
}

export async function saveAnswer(
  sessionId: string,
  questionId: string,
  answer: { selectedOptionId?: string; text?: string },
  clientRevision: number
): Promise<{ savedAt: string; serverRevision: number }> {
  const { data } = await apiFetch<unknown>(endpoints.practiceSlots.answer(sessionId, questionId), {
    method: 'put',
    headers: { Authorization: `Bearer ${ensureToken()}` },
    body: { ...answer, clientRevision },
  });
  return z.object({ savedAt: z.string(), serverRevision: z.number() }).parse(data);
}

export async function submitSession(sessionId: string): Promise<void> {
  await apiFetch<unknown>(endpoints.practiceSlots.submit(sessionId), {
    method: 'post',
    headers: { Authorization: `Bearer ${ensureToken()}` },
    body: {},
  });
}

export async function getResult(sessionId: string): Promise<PracticeResult> {
  const { data } = await apiFetch<unknown>(endpoints.practiceSlots.result(sessionId), {
    headers: { Authorization: `Bearer ${ensureToken()}` },
  });
  return resultSchema.parse(data);
}
