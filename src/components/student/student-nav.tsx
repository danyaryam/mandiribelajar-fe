'use client';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------
// Navigasi header siswa (dashboard, latihan, profil + sub-halaman).
// Client component — dipakai dari layout server (RSC) dengan aman.
// ----------------------------------------------------------------------

const studentLinks = [
  { title: 'Dashboard', path: paths.dashboard },
  { title: 'Latihan', path: paths.courses.configure },
  { title: 'Profil', path: paths.profile },
  { title: 'Pelajari Lagi', path: paths.bookmarks },
  { title: 'Laporan Progres', path: paths.progress },
];

export function StudentNav() {
  return (
    <Box
      component="nav"
      aria-label="Navigasi siswa"
      sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 }, flexWrap: 'wrap' }}
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
      <Button variant="contained" size="medium" component={RouterLink} href={paths.usage}>
        Kuota
      </Button>
    </Box>
  );
}
