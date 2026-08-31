import { env } from 'src/lib/env';

import packageJson from '../package.json';

// ----------------------------------------------------------------------
// Semua env sudah divalidasi zod di src/lib/env.ts (fail-fast saat build bila
// var wajib hilang). Konsumsi konfigurasi lewat objek ini, bukan process.env.

export const CONFIG = {
  appName: 'Mandiri Belajar',
  appVersion: packageJson.version,
  assetsDir: env.NEXT_PUBLIC_ASSETS_DIR,
  /** Tampilkan galeri referensi /components di build production (dev selalu tampil). */
  showComponents: env.NEXT_PUBLIC_SHOW_COMPONENTS,
  /** Mandiri Belajar backend base URL. */
  apiUrl: env.NEXT_PUBLIC_API_URL,
  /** Tenant slug sent as X-Company-Slug on legacy public /api/* endpoints (optional). */
  companySlug: env.NEXT_PUBLIC_COMPANY_SLUG,
  /** Whitelabel client slug (tidak dipakai backbone Mandiri Belajar). */
  clientSlug: env.NEXT_PUBLIC_CLIENT_SLUG,
  /**
   * Public site origin — canonical URLs, OG tags, sitemap, robots.
   * Sudah ternormalisasi (tanpa trailing slash); production wajib di-set.
   */
  siteUrl: env.NEXT_PUBLIC_SITE_URL,
  /** Server-only: override URL API internal (k8s) untuk fetch RSC/sitemap. */
  serverApiUrl: env.API_URL,
};
