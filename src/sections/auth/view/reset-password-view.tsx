'use client';

import type { ReactNode } from 'react';

import { z } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { varAlpha } from 'minimal-shared/utils';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { resetPassword } from 'src/lib/api/auth';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------
// Atur ulang kata sandi (Fase 1, api-contract.md §4 POST /auth/password/reset).
// Token diterima dari link email (query param `token`).
// ----------------------------------------------------------------------

const schema = z
  .object({
    password: z.string().min(8, 'Minimal 8 karakter.'),
    confirmPassword: z.string().min(8, 'Minimal 8 karakter.'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok.',
    path: ['confirmPassword'],
  });

function AuthShell({ children }: { children: ReactNode }) {
  const theme = useTheme();
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
        {children}
      </Paper>
    </Box>
  );
}

export function ResetPasswordView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const handleSubmit = methods.handleSubmit(async (values) => {
    setError(null);
    setSubmitting(true);
    try {
      await resetPassword(token, values.password);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal mengatur ulang kata sandi.');
    } finally {
      setSubmitting(false);
    }
  });

  if (!token) {
    return (
      <AuthShell>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Tautan reset tidak valid. Silakan ulangi dari halaman lupa kata sandi.
        </Alert>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <Stack spacing={1} sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Atur Ulang Kata Sandi
        </Typography>
        <Typography color="text.secondary">Buat kata sandi baru untuk akun Anda.</Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {done ? (
        <Stack spacing={2.5}>
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            Kata sandi berhasil diubah. Silakan masuk dengan kata sandi baru.
          </Alert>
          <Button variant="contained" onClick={() => router.push(paths.auth.login)}>
            Masuk
          </Button>
        </Stack>
      ) : (
        <Form methods={methods} onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <Field.Text
              name="password"
              label="Kata Sandi Baru"
              type="password"
              autoComplete="new-password"
            />
            <Field.Text
              name="confirmPassword"
              label="Konfirmasi Kata Sandi"
              type="password"
              autoComplete="new-password"
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              sx={{ py: 1.4, fontWeight: 800, borderRadius: 2 }}
            >
              {submitting ? 'Menyimpan…' : 'Simpan Kata Sandi'}
            </Button>
          </Stack>
        </Form>
      )}

      <Stack direction="row" spacing={0.5} sx={{ mt: 3, justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Sudah ingat?
        </Typography>
        <Link
          component={RouterLink}
          href={paths.auth.login}
          variant="body2"
          sx={{ fontWeight: 700 }}
        >
          Masuk
        </Link>
      </Stack>
    </AuthShell>
  );
}
