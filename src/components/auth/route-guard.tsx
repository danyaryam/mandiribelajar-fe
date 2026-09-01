'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { getAccessToken, refreshSession } from 'src/lib/api/auth';

// ----------------------------------------------------------------------
// Route guard untuk area yang memerlukan login (Fase 1, §5 proteksi route).
// Karena access token disimpan in-memory (bukan cookie), guard membaca token
// dari modul auth. Saat tidak ada token, redirect ke /auth/login dengan
// redirect target (returnTo) sehingga setelah login pengguna kembali.
// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function RouteGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        if (!getAccessToken()) await refreshSession();
        if (active) setReady(true);
      } catch {
        if (active) {
          const returnTo = encodeURIComponent(pathname);
          router.replace(`${paths.auth.login}?returnTo=${returnTo}`);
        }
      }
    }

    void restoreSession();
    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">Memeriksa sesi…</Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
