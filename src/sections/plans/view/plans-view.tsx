'use client';

import type { Plan } from 'src/lib/api/billing';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';

import { ApiError } from 'src/lib/api/client';
import { getAccessToken } from 'src/lib/api/auth';
import { getPlans, checkout } from 'src/lib/api/billing';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Halaman paket harga (Fase 6). Plan publik; checkout butuh login.
// ----------------------------------------------------------------------

export function PlansView() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const handleCheckout = async (plan: Plan) => {
    setError(null);
    if (!getAccessToken()) {
      router.push(paths.auth.login);
      return;
    }
    setChecking(plan.id);
    try {
      const result = await checkout(plan.id);
      // Sandbox: redirect to the simulated checkout URL (or result page).
      window.open(result.checkoutUrl, '_blank', 'noopener,noreferrer');
      router.push(paths.payments.root);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Terjadi kesalahan saat checkout.');
    } finally {
      setChecking(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h3" gutterBottom>
          Paket Harga
        </Typography>
        <Typography color="text.secondary">
          Pilih paket yang sesuai dengan kebutuhan belajarmu.
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {(plans.length ? plans : []).map((plan) => (
          <Grid key={plan.id} size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="overline" color="primary">
                  {plan.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography variant="h3">Rp {plan.amount.toLocaleString('id-ID')}</Typography>
                  <Typography color="text.secondary">/ {plan.period}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {plan.description}
                </Typography>

                <Stack spacing={1}>
                  {plan.features.map((f) => (
                    <Stack key={f} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Iconify
                        icon="eva:checkmark-fill"
                        width={18}
                        sx={{ color: 'primary.main' }}
                      />
                      <Typography variant="body2">{f}</Typography>
                    </Stack>
                  ))}
                </Stack>

                <Box sx={{ mt: 'auto', pt: 2 }}>
                  <Button
                    fullWidth
                    variant={plan.slug === 'premium' ? 'contained' : 'outlined'}
                    disabled={checking === plan.id}
                    onClick={() => handleCheckout(plan)}
                  >
                    {checking === plan.id
                      ? 'Memproses…'
                      : plan.amount === 0
                        ? 'Gratis'
                        : 'Pilih Paket'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {!loading && plans.length === 0 && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          Belum ada paket tersedia.
        </Typography>
      )}
    </Container>
  );
}
