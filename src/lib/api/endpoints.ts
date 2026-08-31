// ----------------------------------------------------------------------
// Centralized backend endpoint map (mirror of src/routes/paths.ts for API URLs).
// Contract: Mandiri Belajar api-contract.md (base path /api/v1).
//
// Paths are relative (no leading slash) so they resolve against ky's
// `baseUrl` even when it carries a path prefix.

export const endpoints = {
  // Legacy marketplace-be endpoints (kept for the article/support verticals).
  articles: {
    list: 'api/articles',
    details: (slug: string) => `api/articles/${encodeURIComponent(slug)}`,
    categories: 'api/article-categories',
  },
  faq: {
    list: 'api/faq',
  },
  siteContent: {
    map: 'api/site-content',
  },

  // Mandiri Belajar catalog (api-contract.md §6) — base /api/v1.
  catalog: {
    educationLevels: 'api/v1/education-levels',
    gradesByLevel: (levelId: string) =>
      `api/v1/education-levels/${encodeURIComponent(levelId)}/grades`,
    subjects: 'api/v1/subjects',
    subjectDetails: (subjectId: string) => `api/v1/subjects/${encodeURIComponent(subjectId)}`,
    topics: 'api/v1/topics',
  },

  // Mandiri Belajar auth (api-contract.md §4) — base /api/v1.
  auth: {
    register: 'api/v1/auth/register',
    login: 'api/v1/auth/login',
    refresh: 'api/v1/auth/refresh',
    logout: 'api/v1/auth/logout',
    me: 'api/v1/me',
  },

  // Mandiri Belajar practice (api-contract.md §7) — base /api/v1.
  practiceSlots: {
    create: 'api/v1/practice-sessions',
    list: 'api/v1/practice-sessions',
    status: (sessionId: string) => `api/v1/practice-sessions/${sessionId}/status`,
    start: (sessionId: string) => `api/v1/practice-sessions/${sessionId}/start`,
    detail: (sessionId: string) => `api/v1/practice-sessions/${sessionId}`,
    answer: (sessionId: string, questionId: string) =>
      `api/v1/practice-sessions/${sessionId}/answers/${questionId}`,
    submit: (sessionId: string) => `api/v1/practice-sessions/${sessionId}/submit`,
    result: (sessionId: string) => `api/v1/practice-sessions/${sessionId}/result`,
  },

  // Mandiri Belajar me (api-contract.md §5) — base /api/v1.
  me: {
    dashboard: 'api/v1/me/dashboard',
    usage: 'api/v1/me/usage',
  },

  // Mandiri Belajar billing (api-contract.md §8) — base /api/v1.
  billing: {
    plans: 'api/v1/plans',
    checkout: 'api/v1/payments/checkout',
    payments: 'api/v1/payments',
    paymentDetails: (paymentId: string) => `api/v1/payments/${paymentId}`,
    webhook: (provider: string) => `api/v1/webhooks/payments/${provider}`,
  },
};
