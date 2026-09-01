import { SimpleLayout } from 'src/layouts/simple';

import { Logo } from 'src/components/logo';
import { RouteGuard } from 'src/components/auth';
import { StudentNav } from 'src/components/student/student-nav';

// ----------------------------------------------------------------------
// Layout grup siswa. Header memuat navigasi akun (via <StudentNav />,
// client component) supaya Profil + sub-halaman mudah diakses.
// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function StudentLayout({ children }: Props) {
  return (
    <SimpleLayout
      slotProps={{
        header: {
          slots: {
            leftArea: <Logo />,
            rightArea: <StudentNav />,
          },
        },
      }}
    >
      <RouteGuard>{children}</RouteGuard>
    </SimpleLayout>
  );
}
