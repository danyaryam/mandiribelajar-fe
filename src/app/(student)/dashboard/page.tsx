import type { Metadata } from 'next';

import { DashboardView } from 'src/sections/dashboard/view/dashboard-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Ringkasan progres dan rekomendasi latihan.',
};

export default function DashboardPage() {
  return <DashboardView />;
}
