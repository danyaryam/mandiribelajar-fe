// ----------------------------------------------------------------------
// Semua string route terpusat di sini — jangan hardcode URL di komponen.
//
// Kebijakan trailing slash: entri di bawah TANPA trailing slash (Next
// menormalkan saat navigasi karena `trailingSlash: true`). Untuk URL yang
// dipublikasikan ke crawler (canonical, sitemap, JSON-LD), SELALU tambahkan
// '/' di akhir — gunakan `pathWithSlash()` supaya konsisten.

export const pathWithSlash = (path: string) => (path.endsWith('/') ? path : `${path}/`);

export const paths = {
  home: '/',
  /**
   * Katalog pendidikan (publik)
   */
  catalog: {
    root: '/catalog',
    subjects: (levelId?: string, gradeId?: string) =>
      levelId || gradeId
        ? `/catalog?levelId=${levelId ?? ''}&gradeId=${gradeId ?? ''}`
        : '/catalog',
    subject: (subjectId: string) => `/catalog/subjects/${subjectId}`,
  },
  /**
   * Autentikasi
   */
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    googleCallback: '/auth/google/callback',
  },
  /**
   * Dashboard siswa (protect)
   */
  dashboard: '/dashboard',
  /**
   * Latihan / course siswa
   */
  courses: {
    root: '/courses',
    configure: '/courses/configure',
    session: (sessionId: string) => `/courses/${sessionId}`,
    result: (sessionId: string) => `/courses/${sessionId}/result`,
  },
  /**
   * Profil & pembayaran
   */
  /**
   * Profil & pembayaran
   */
  profile: '/profile',
  usage: '/profile/usage',
  progress: '/profile/progress',
  bookmarks: '/profile/bookmarks',
  /**
   * Admin
   */
  admin: {
    root: '/admin',
    plans: '/admin/plans',
    payments: '/admin/payments',
    catalog: '/admin/catalog',
    aiGenerations: '/admin/ai-generations',
    questionReports: '/admin/question-reports',
  },
  payments: {
    root: '/payments',
    plans: '/payments/plans',
    result: '/payments/result',
  },
  /**
   * Article (legacy marketing vertical)
   */
  article: {
    root: '/article',
    details: (slug: string) => `/article/${slug}`,
  },
  /**
   * Common
   */
  maintenance: '/maintenance',
  comingSoon: '/coming-soon',
  support: '/support',
  page404: '/error/404',
  page500: '/error/500',
  /**
   * Others
   */
  blank: '/blank',
  components: '/components',
};
