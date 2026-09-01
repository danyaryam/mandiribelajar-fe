import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { SimpleLayout } from 'src/layouts/simple';

import { Logo } from 'src/components/logo';
import { RouteGuard } from 'src/components/auth';

// ----------------------------------------------------------------------
// Layout grup siswa. Header memuat navigasi akun (Dashboard, Latihan,
// Profil + sub-halaman) supaya Profil dan fiturnya mudah diakses.
// ----------------------------------------------------------------------

const studentLinks = [
  { title: 'Dashboard', path: paths.dashboard },
  { title: 'Latihan', path: paths.courses.configure },
  { title: 'Profil', path: paths.profile },
  { title: 'Pelajari Lagi', path: paths.bookmarks },
  { title: 'Laporan Progres', path: paths.progress },
];

type Props = {
  children: React.ReactNode;
};

export default function StudentLayout({ children }: Props) {
  const renderNav = () => (
    <Box
      component="nav"
      aria-label="Navigasi siswa"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 0.5, md: 1 },
        flexWrap: 'wrap',
      }}
    >
      {studentLinks.map((item) => (
        <Link
          key={item.path}
          component={RouterLink}
          href={item.path}
          color="inherit"
          sx={{ typography: 'subtitle2', whiteSpace: 'nowrap', px: 0.5 }}
        >
          {item.title}
        </Link>
      ))}
    </Box>
  );

  return (
    <SimpleLayout
      slotProps={{
        header: {
          slots: {
            leftArea: <Logo />,
            rightArea: (
              <>
                {renderNav()}
                <Button variant="contained" size="medium" component={RouterLink} href={paths.usage}>
                  Kuota
                </Button>
              </>
            ),
          },
        },
      }}
    >
      <RouteGuard>{children}</RouteGuard>
    </SimpleLayout>
  );
}
