'use client';

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

const BULLETS = [
  { icon: '🎯', title: 'Soal sesuai kurikulum', desc: 'Jenjang, kelas, mapel & topik pilihanmu.' },
  { icon: '🤖', title: 'Dibuat AI, dikoreksi otomatis', desc: 'Soal + kunci + penjelasan instan.' },
  { icon: '📈', title: 'Pantau progres', desc: 'Streak, skor, dan topik yang perlu diulang.' },
];

export function AuthView({ mode }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
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
      router.push(returnTo ? decodeURIComponent(returnTo) : paths.dashboard);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr' }, minHeight: '100vh' }}>
      {/* Brand panel — hidden on small screens */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          p: 7,
          color: '#fff',
          ...theme.mixins.bgGradient({
            images: [
              `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.darkerChannel, 0.95)}, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.88)} 55%, ${varAlpha(theme.vars.palette.secondary.mainChannel, 0.8)})`,
            ],
          }),
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
          Belajar mandiri,
          <br />
          kupas tuntas.
        </Typography>
        <Typography sx={{ opacity: 0.92, mb: 5, maxWidth: 420 }}>
          Latihan soal berbasis AI untuk SD/MI, SMP/MTs, dan SMA/MA — lewat koreksi otomatis dan
          penjelasan untuk menguasai setiap topik.
        </Typography>
        <Stack spacing={3}>
          {BULLETS.map((b) => (
            <Stack key={b.title} direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 24,
                  bgcolor: 'rgba(255,255,255,.16)',
                }}
              >
                {b.icon}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{b.title}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  {b.desc}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Form panel */}
      <Box
        sx={{
          display: 'grid',
          placeItems: 'center',
          p: { xs: 3, md: 6 },
          bgcolor: (t) => t.vars.palette.background.default,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 440,
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            border: (t) => `solid 1px ${varAlpha(t.vars.palette.grey['500Channel'], 0.16)}`,
            boxShadow: '0 12px 40px rgba(0,0,0,.08)',
          }}
        >
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {isLogin ? 'Masuk' : 'Buat Akun'}
            </Typography>
            <Typography color="text.secondary">
              {isLogin
                ? 'Selamat datang kembali di Mandiri Belajar.'
                : 'Mulai latihan soal berbasis AI.'}
            </Typography>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
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
                <Field.Checkbox
                  name="acceptedTerms"
                  label="Saya menyetujui Syarat dan Ketentuan."
                />
              )}

              {isLogin && (
                <Link
                  component={RouterLink}
                  href={paths.auth.forgotPassword}
                  variant="body2"
                  sx={{ alignSelf: 'flex-end' }}
                >
                  Lupa kata sandi?
                </Link>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting}
                sx={{ py: 1.4, fontWeight: 800, borderRadius: 2 }}
              >
                {submitting ? 'Memproses…' : isLogin ? 'Masuk' : 'Daftar Sekarang'}
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
              sx={{ fontWeight: 700 }}
            >
              {isLogin ? 'Daftar' : 'Masuk'}
            </Link>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
