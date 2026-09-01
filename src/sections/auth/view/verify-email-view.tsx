'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { ApiError } from 'src/lib/api/client';
import { confirmEmailVerification } from 'src/lib/api/auth';

// ----------------------------------------------------------------------
// Verifikasi email (Fase 1, api-contract.md §4 POST /auth/email/verify/confirm).
// Token diterima dari link email (query param `token`).
// ----------------------------------------------------------------------

type Status = 'loading' | 'verified' | 'error';

export function VerifyEmailView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Tautan verifikasi tidak valid.');
      setStatus('error');
      return;
    }
    confirmEmailVerification(token)
      .then(() => setStatus('verified'))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Gagal memverifikasi email.');
        setStatus('error');
      });
  }, [token]);

  return (
    <Box sx={{ maxWidth: 440, mx: 'auto', px: 3, py: 10, textAlign: 'center' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Verifikasi Email
      </Typography>

      {status === 'loading' && <Typography color="text.secondary">Memverifikasi…</Typography>}

      {status === 'verified' && (
        <Stack spacing={2.5} sx={{ mt: 2 }}>
          <Alert severity="success">Email Anda berhasil diverifikasi. Silakan masuk.</Alert>
          <Button variant="contained" onClick={() => router.push(paths.auth.login)}>
            Masuk
          </Button>
        </Stack>
      )}

      {status === 'error' && (
        <Stack spacing={2}>
          <Alert severity="warning">{error ?? 'Terjadi kesalahan.'}</Alert>
          <Typography variant="body2" color="text.secondary">
            Tautan mungkin sudah kedaluwarsa. Klik di bawah untuk melihat langkah berikutnya, atau
            hubungi dukungan.
          </Typography>
          <Link component={RouterLink} href={paths.auth.login} variant="body2">
            Kembali ke halaman masuk
          </Link>
        </Stack>
      )}
    </Box>
  );
}
