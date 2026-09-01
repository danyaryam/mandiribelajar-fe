'use client';

import { z } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { forgotPassword } from 'src/lib/api/auth';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------
// Lupa kata sandi (Fase 1, api-contract.md §4 POST /auth/password/forgot).
// ----------------------------------------------------------------------

const schema = z.object({
  email: z.string().email('Format email tidak valid.'),
});

export function ForgotPasswordView() {
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
    <Box sx={{ maxWidth: 440, mx: 'auto', px: 3, py: 10 }}>
      <Stack spacing={1} sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4">Lupa Kata Sandi</Typography>
        <Typography color="text.secondary">
          Kami akan mengirim tautan untuk mengatur ulang kata sandi ke email Anda.
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {emailSent ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          Jika email terdaftar, tautan reset telah dikirim. Periksa kotak masuk Anda.
        </Alert>
      ) : (
        <Form methods={methods} onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <Field.Text name="email" label="Email" type="email" autoComplete="email" />
            <Button type="submit" variant="contained" size="large">
              Kirim Tautan Reset
            </Button>
          </Stack>
        </Form>
      )}

      <Stack direction="row" spacing={0.5} sx={{ mt: 3, justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Ingat kata sandi?
        </Typography>
        <Link component={RouterLink} href={paths.auth.login} variant="body2">
          Masuk
        </Link>
      </Stack>
    </Box>
  );
}
