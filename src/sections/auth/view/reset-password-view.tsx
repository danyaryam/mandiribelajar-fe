'use client';

import { z } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
      <Box sx={{ maxWidth: 440, mx: 'auto', px: 3, py: 10 }}>
        <Alert severity="warning">
          Tautan reset tidak valid. Silakan ulangi dari halaman lupa kata sandi.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 440, mx: 'auto', px: 3, py: 10 }}>
      <Stack spacing={1} sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4">Atur Ulang Kata Sandi</Typography>
        <Typography color="text.secondary">Buat kata sandi baru untuk akun Anda.</Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {done ? (
        <Stack spacing={2.5}>
          <Alert severity="success">
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
            <Button type="submit" variant="contained" size="large" disabled={submitting}>
              {submitting ? 'Menyimpan…' : 'Simpan Kata Sandi'}
            </Button>
          </Stack>
        </Form>
      )}

      <Stack direction="row" spacing={0.5} sx={{ mt: 3, justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Sudah ingat?
        </Typography>
        <Link component={RouterLink} href={paths.auth.login} variant="body2">
          Masuk
        </Link>
      </Stack>
    </Box>
  );
}
