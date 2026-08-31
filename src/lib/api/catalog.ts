import { z } from 'zod';

import { apiFetch } from './client';
import { endpoints } from './endpoints';

// ----------------------------------------------------------------------
// Schemas — mirror api-contract.md §6 (catalog, public read-only).
// Validated at the fetch boundary so contract drift fails loudly here.
// ----------------------------------------------------------------------

const nullableList = <T extends z.ZodTypeAny>(item: T) =>
  z
    .array(item)
    .nullish()
    .transform((value) => value ?? []);

export const educationLevelSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  slug: z.string(),
});

export type EducationLevel = z.infer<typeof educationLevelSchema>;

export const gradeSchema = z.object({
  id: z.string(),
  number: z.number(),
  name: z.string(),
  levelCode: z.string().optional(),
});

export type Grade = z.infer<typeof gradeSchema>;

export const subjectListItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().optional().default(''),
});

export type SubjectListItem = z.infer<typeof subjectListItemSchema>;

export const topicRefSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().optional().default(''),
});

export const subjectDetailSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().optional().default(''),
  level: educationLevelSchema.nullable().optional(),
  grade: z.object({ id: z.string(), number: z.number(), name: z.string() }).nullable().optional(),
  learningOutcomes: nullableList(z.string()),
  topics: nullableList(topicRefSchema),
});

export type SubjectDetail = z.infer<typeof subjectDetailSchema>;

// ----------------------------------------------------------------------
// Query keys — shared by client hooks and server-side prefetchQuery.
// ----------------------------------------------------------------------

const base = ['catalog'] as const;

export const catalogKeys = {
  educationLevels: [...base, 'education-levels'] as const,
  grades: (levelId: string) => [...base, 'grades', levelId] as const,
  subjects: (filters: { levelId?: string; gradeId?: string }) =>
    [
      ...base,
      'subjects',
      { levelId: filters.levelId ?? '', gradeId: filters.gradeId ?? '' },
    ] as const,
  subjectDetails: (subjectId: string, filters: { levelId?: string; gradeId?: string }) =>
    [
      ...base,
      'subject',
      subjectId,
      { levelId: filters.levelId ?? '', gradeId: filters.gradeId ?? '' },
    ] as const,
  topics: (filters: { subjectId?: string; levelId?: string; gradeId?: string }) =>
    [
      ...base,
      'topics',
      {
        subjectId: filters.subjectId ?? '',
        levelId: filters.levelId ?? '',
        gradeId: filters.gradeId ?? '',
      },
    ] as const,
};

// ----------------------------------------------------------------------
// Fetchers — usable from Server Components (ISR) and browser (TanStack).
// ----------------------------------------------------------------------

export const CATALOG_TAG = 'catalog';

type FetchOptions = {
  signal?: AbortSignal;
  revalidate?: number;
};

export async function getEducationLevels(options: FetchOptions = {}): Promise<EducationLevel[]> {
  const { data } = await apiFetch<unknown>(endpoints.catalog.educationLevels, {
    signal: options.signal,
    next: { revalidate: options.revalidate ?? 300, tags: [CATALOG_TAG] },
  });
  return nullableList(educationLevelSchema).parse(data);
}

export async function getGradesByLevel(
  levelId: string,
  options: FetchOptions = {}
): Promise<Grade[]> {
  const { data } = await apiFetch<unknown>(endpoints.catalog.gradesByLevel(levelId), {
    signal: options.signal,
    next: { revalidate: options.revalidate ?? 300, tags: [CATALOG_TAG] },
  });
  return nullableList(gradeSchema).parse(data);
}

export async function getSubjects(
  filters: { levelId?: string; gradeId?: string } = {},
  options: FetchOptions = {}
): Promise<SubjectListItem[]> {
  const { data } = await apiFetch<unknown>(endpoints.catalog.subjects, {
    params: { levelId: filters.levelId, gradeId: filters.gradeId },
    signal: options.signal,
    next: { revalidate: options.revalidate ?? 300, tags: [CATALOG_TAG] },
  });
  return nullableList(subjectListItemSchema).parse(data);
}

export async function getSubject(
  subjectId: string,
  filters: { levelId?: string; gradeId?: string } = {},
  options: FetchOptions = {}
): Promise<SubjectDetail | null> {
  const { data } = await apiFetch<unknown>(endpoints.catalog.subjectDetails(subjectId), {
    params: { levelId: filters.levelId, gradeId: filters.gradeId },
    signal: options.signal,
    next: { revalidate: options.revalidate ?? 300, tags: [CATALOG_TAG] },
  });
  if (data == null) return null;
  return subjectDetailSchema.parse(data);
}
