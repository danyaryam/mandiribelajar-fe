import type { Metadata } from 'next';

import { PlansView } from 'src/sections/plans/view/plans-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Paket Harga',
  description: 'Pilih paket latihan Mandiri Belajar yang sesuai.',
};

export default function PlansPage() {
  return <PlansView />;
}
