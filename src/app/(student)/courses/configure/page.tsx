import type { Metadata } from 'next';

import { PracticeConfigureView } from 'src/sections/practice/view/practice-configure-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Konfigurasi Latihan',
};

export default function ConfigurePage() {
  return <PracticeConfigureView />;
}
