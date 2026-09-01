import { z } from 'zod';

import { endpoints } from './endpoints';
import { getAccessToken } from './auth';
import { ApiError, apiFetch } from './client';

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
  topicBreakdown: nullableList(
    z.object({ topicId: z.string(), topicName: z.string(), score: z.number() })
  ),
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

export const sessionHistorySchema = z.object({
  id: z.string(),
  status: z.string(),
  title: z.string(),
  difficulty: z.string(),
  score: z.number().nullable().optional(),
  maxScore: z.number().nullable().optional(),
  createdAt: z.string(),
  submittedAt: z.string().nullable().optional(),
});

export type SessionHistoryItem = z.infer<typeof sessionHistorySchema>;

export async function listSessions(): Promise<SessionHistoryItem[]> {
  const { data } = await apiFetch<unknown>(endpoints.practiceSlots.list, {
    headers: { Authorization: `Bearer ${ensureToken()}` },
    next: { revalidate: 0 },
  });
  return nullableList(sessionHistorySchema).parse(data);
}

// ----------------------------------------------------------------------
// A reusable idempotency-key for a single user action (optional).
// ----------------------------------------------------------------------

let _idemKey: string | null = null;

export function generateIdempotencyKey(): string {
  if (!_idemKey) {
    _idemKey =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `idem-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
  return _idemKey;
}

export async function getResult(sessionId: string): Promise<PracticeResult> {
  const { data } = await apiFetch<unknown>(endpoints.practiceSlots.result(sessionId), {
    headers: { Authorization: `Bearer ${ensureToken()}` },
  });
  return resultSchema.parse(data);
}

// ----------------------------------------------------------------------
// Bookmark ("pelajari lagi") dan laporan kualitas soal.
// ----------------------------------------------------------------------

export const bookmarkItemSchema = z.object({
  questionId: z.string(),
  type: z.string(),
  prompt: z.string(),
  subjectId: z.string(),
  createdAt: z.string(),
});

export type BookmarkItem = z.infer<typeof bookmarkItemSchema>;

export async function listBookmarks(): Promise<BookmarkItem[]> {
  const { data } = await apiFetch<unknown>(endpoints.questions.bookmarks, {
    headers: { Authorization: `Bearer ${ensureToken()}` },
    next: { revalidate: 0 },
  });
  return nullableList(bookmarkItemSchema).parse(data);
}

export async function addBookmark(questionId: string): Promise<void> {
  await apiFetch<unknown>(endpoints.questions.bookmark(questionId), {
    method: 'post',
    headers: { Authorization: `Bearer ${ensureToken()}` },
  });
}

export async function removeBookmark(questionId: string): Promise<void> {
  await apiFetch<unknown>(endpoints.questions.bookmark(questionId), {
    method: 'delete',
    headers: { Authorization: `Bearer ${ensureToken()}` },
  });
}

export const questionReportSchema = z.object({
  reason: z.string(),
  note: z.string().optional(),
});

export async function reportQuestion(
  sessionId: string,
  questionId: string,
  reason: string,
  note?: string
): Promise<void> {
  await apiFetch<unknown>(endpoints.practiceSlots.report(sessionId, questionId), {
    method: 'post',
    headers: { Authorization: `Bearer ${ensureToken()}` },
    body: { reason, note },
  });
}
