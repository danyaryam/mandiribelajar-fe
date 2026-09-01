'use client';

import { z } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { varAlpha } from 'minimal-shared/utils';
import { zodResolver } from '@hookform/resolvers/zod';

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
import { forgotPassword } from 'src/lib/api/auth';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------
// Lupa kata sandi (Fase 1, api-contract.md §4 POST /auth/password/forgot).
// ----------------------------------------------------------------------

const schema = z.object({
  email: z.string().email('Format email tidak valid.'),
});

export function ForgotPasswordView() {
  const theme = useTheme();
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const handleSubmit = methods.handleSubmit(async (values) => {
    setError(null);
    try {
      await forgotPassword(values.email);
      setEmailSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Terjadi kesalahan. Coba lagi.');
    }
  });

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
        <Stack spacing={1} sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Lupa Kata Sandi
          </Typography>
          <Typography color="text.secondary">
            Kami akan mengirim tautan untuk mengatur ulang kata sandi ke email Anda.
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {emailSent ? (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            Jika email terdaftar, tautan reset telah dikirim. Periksa kotak masuk Anda.
          </Alert>
        ) : (
          <Form methods={methods} onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <Field.Text name="email" label="Email" type="email" autoComplete="email" />
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ py: 1.4, fontWeight: 800, borderRadius: 2 }}
              >
                Kirim Tautan Reset
              </Button>
            </Stack>
          </Form>
        )}

        <Stack direction="row" spacing={0.5} sx={{ mt: 3, justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Ingat kata sandi?
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
      </Paper>
    </Box>
  );
}
