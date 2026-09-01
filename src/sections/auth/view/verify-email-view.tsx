'use client';

import { useState, useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { useRouter, useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
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
  const theme = useTheme();
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: { xs: 3, md: 6 },
        bgcolor: (t) => t.vars.palette.background.default,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 440,
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          border: (t) => `solid 1px ${varAlpha(t.vars.palette.grey['500Channel'], 0.16)}`,
          boxShadow: '0 12px 40px rgba(0,0,0,.08)',
          overflow: 'hidden',
          textAlign: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 5,
            ...theme.mixins.bgGradient({
              images: [
                `linear-gradient(90deg, ${varAlpha(theme.vars.palette.primary.darkerChannel, 0.95)}, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.9)} 55%, ${varAlpha(theme.vars.palette.secondary.mainChannel, 0.8)})`,
              ],
            }),
          },
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
          Verifikasi Email
        </Typography>

        {status === 'loading' && (
          <Stack spacing={2} sx={{ alignItems: 'center' }}>
            <Typography sx={{ fontSize: 44 }}>📧</Typography>
            <Typography color="text.secondary">Memverifikasi…</Typography>
          </Stack>
        )}

        {status === 'verified' && (
          <Stack spacing={2.5} sx={{ mt: 2 }}>
            <Typography sx={{ fontSize: 48 }}>✅</Typography>
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              Email Anda berhasil diverifikasi. Silakan masuk.
            </Alert>
            <Button
              variant="contained"
              onClick={() => router.push(paths.auth.login)}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              Masuk
            </Button>
          </Stack>
        )}

        {status === 'error' && (
          <Stack spacing={2}>
            <Typography sx={{ fontSize: 44 }}>⚠️</Typography>
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              {error ?? 'Terjadi kesalahan.'}
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Tautan mungkin sudah kedaluwarsa. Klik di bawah untuk melihat langkah berikutnya, atau
              hubungi dukungan.
            </Typography>
            <Link
              component={RouterLink}
              href={paths.auth.login}
              variant="body2"
              sx={{ fontWeight: 700 }}
            >
              Kembali ke halaman masuk
            </Link>
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
