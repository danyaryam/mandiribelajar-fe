'use client';

import { z } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { ApiError } from 'src/lib/api/client';
import { login, register } from 'src/lib/api/auth';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid.'),
  password: z.string().min(8, 'Minimal 8 karakter.'),
});

const registerSchema = z
  .object({
    name: z.string().min(2, 'Minimal 2 karakter.'),
    email: z.string().email('Format email tidak valid.'),
    password: z.string().min(8, 'Minimal 8 karakter.'),
    confirmPassword: z.string().min(8, 'Minimal 8 karakter.'),
    acceptedTerms: z.boolean().refine((v) => v === true, 'Wajib menyetujui syarat & ketentuan.'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok.',
    path: ['confirmPassword'],
  });

// ----------------------------------------------------------------------

type Props = {
  mode: 'login' | 'register';
};

type RegisterValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};

export function AuthView({ mode }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isLogin = mode === 'login';

  const methods = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    defaultValues: isLogin
      ? { email: '', password: '' }
      : { name: '', email: '', password: '', confirmPassword: '', acceptedTerms: false },
  });

  const handleSubmit = methods.handleSubmit(async (values) => {
    setError(null);
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(values.email, values.password);
      } else {
        const v = values as unknown as RegisterValues;
        await register({
          name: v.name,
          email: v.email,
          password: v.password,
          acceptedTermsVersion: '2026-08-01',
        });
      }
      router.push(paths.dashboard);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Box sx={{ maxWidth: 440, mx: 'auto', px: 3, py: 10 }}>
      <Stack spacing={1} sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4">{isLogin ? 'Masuk' : 'Daftar'}</Typography>
        <Typography color="text.secondary">
          {isLogin ? 'Selamat datang kembali di Mandiri Belajar.' : 'Mulai latihan soal berbasis AI.'}
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Form methods={methods} onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          {!isLogin && <Field.Text name="name" label="Nama Lengkap" autoComplete="name" />}

          <Field.Text name="email" label="Email" type="email" autoComplete="email" />

          <Field.Text
            name="password"
            label="Kata Sandi"
            type="password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />

          {!isLogin && (
            <Field.Text
              name="confirmPassword"
              label="Konfirmasi Kata Sandi"
              type="password"
              autoComplete="new-password"
            />
          )}

          {!isLogin && (
            <Field.Checkbox name="acceptedTerms" label="Saya menyetujui Syarat dan Ketentuan." />
          )}

          <Button type="submit" variant="contained" size="large" disabled={submitting}>
            {submitting ? 'Memproses…' : isLogin ? 'Masuk' : 'Daftar'}
          </Button>
        </Stack>
      </Form>

      <Stack direction="row" spacing={0.5} sx={{ mt: 3, justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
        </Typography>
        <Link
          component={RouterLink}
          href={isLogin ? paths.auth.register : paths.auth.login}
          variant="body2"
        >
          {isLogin ? 'Daftar' : 'Masuk'}
        </Link>
      </Stack>
    </Box>
  );
}
