'use client';

import { useQuery } from '@tanstack/react-query';

import {
  getSubject,
  catalogKeys,
  getSubjects,
  getGradesByLevel,
  getEducationLevels,
} from './catalog';

export function useEducationLevelsQuery() {
  return useQuery({
    queryKey: catalogKeys.educationLevels,
    queryFn: ({ signal }) => getEducationLevels({ signal }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGradesByLevelQuery(levelId: string | undefined) {
  return useQuery({
    queryKey: catalogKeys.grades(levelId ?? ''),
    queryFn: ({ signal }) => getGradesByLevel(levelId ?? '', { signal }),
    enabled: Boolean(levelId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubjectsQuery(filters: { levelId?: string; gradeId?: string }) {
  return useQuery({
    queryKey: catalogKeys.subjects(filters),
    queryFn: ({ signal }) => getSubjects(filters, { signal }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubjectQuery(
  subjectId: string | undefined,
  filters: { levelId?: string; gradeId?: string }
) {
  return useQuery({
    queryKey: catalogKeys.subjectDetails(subjectId ?? '', filters),
    queryFn: ({ signal }) => getSubject(subjectId ?? '', filters, { signal }),
    enabled: Boolean(subjectId),
    staleTime: 5 * 60 * 1000,
  });
}
