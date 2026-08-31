import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { CatalogView } from 'src/sections/catalog/view/catalog-view';

// ----------------------------------------------------------------------

const TITLE = 'Katalog Mata Pelajaran | Mandiri Belajar';
const DESCRIPTION =
  'Jelajahi jenjang, kelas, dan mata pelajaran untuk latihan soal SD/MI, SMP/MTs, dan SMA/MA.';

export const metadata: Metadata = {
  title: 'Katalog Mata Pelajaran',
  description: DESCRIPTION,
  alternates: { canonical: '/catalog/' },
  openGraph: {
    type: 'website',
    siteName: CONFIG.appName,
    locale: 'id_ID',
    url: '/catalog',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/opengraph-image.png'],
  },
};

export default function Page() {
  return <CatalogView />;
}
