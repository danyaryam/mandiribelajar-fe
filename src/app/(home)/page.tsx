import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { getEducationLevels } from 'src/lib/api';
import { webSiteJsonLd, toJsonLdScript } from 'src/lib/seo';

import { LandingView } from 'src/sections/landing/view/landing-view';

// ----------------------------------------------------------------------

const TITLE = 'Mandiri Belajar | Latihan Soal Berbasis AI';
const DESCRIPTION =
  'Platform latihan soal berbasis AI untuk pelajar SD/MI, SMP/MTs, dan SMA/MA. Pilih materi, kerjakan soal, dan pahami penjelasan untuk belajar mandiri.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: CONFIG.appName,
    locale: 'id_ID',
    url: '/',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/opengraph-image.png'],
  },
};

export default async function Page() {
  // ISR (300s). Backend down → null → landing falls back to static copy.
  const levels = await getEducationLevels().catch(() => null);

  const jsonLd = [webSiteJsonLd()];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(jsonLd) }}
      />
      <LandingView levels={levels} />
    </>
  );
}
