import { SimpleLayout } from 'src/layouts/simple';

import { RouteGuard } from 'src/components/auth';

// ----------------------------------------------------------------------
// Layout grup siswa. Fase 1: route guard (auth required) — mengalihkan ke
// halaman login saat pengguna belum memiliki access token (plan.md §2/§5).
// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function StudentLayout({ children }: Props) {
  return (
    <SimpleLayout>
      <RouteGuard>{children}</RouteGuard>
    </SimpleLayout>
  );
}
