'use client';

import type { Plan } from 'src/lib/api/billing';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
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
  const theme = useTheme();
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
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Header */}
      <Box
        sx={{
          borderRadius: 3,
          p: { xs: 4, md: 6 },
          mb: 5,
          textAlign: 'center',
          color: '#fff',
          ...theme.mixins.bgGradient({
            images: [
              `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.darkerChannel, 0.92)}, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.85)} 55%, ${varAlpha(theme.vars.palette.secondary.mainChannel, 0.75)})`,
            ],
          }),
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
          Paket Harga
        </Typography>
        <Typography sx={{ opacity: 0.92, maxWidth: 520, mx: 'auto' }}>
          Pilih paket yang sesuai dengan kebutuhan belajarmu.
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
        {(plans.length ? plans : []).map((plan) => {
          const featured = plan.slug === 'premium';
          return (
            <Grid key={plan.id} size={{ xs: 12, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  position: 'relative',
                  height: '100%',
                  borderRadius: 3,
                  border: featured
                    ? `solid 1px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.5)}`
                    : `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
                  background: featured
                    ? `linear-gradient(160deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.12)}, ${varAlpha(theme.vars.palette.secondary.mainChannel, 0.06)} 60%, rgba(255,255,255,0))`
                    : `linear-gradient(135deg, ${varAlpha(theme.vars.palette.grey['500Channel'], 0.04)}, rgba(255,255,255,0))`,
                  transition: 'transform .18s, box-shadow .18s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: featured
                      ? '0 16px 40px rgba(0,0,0,.14)'
                      : '0 10px 28px rgba(0,0,0,.10)',
                  },
                }}
              >
                {featured && (
                  <Chip
                    label="POPULER"
                    size="small"
                    color="primary"
                    variant="filled"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      right: 20,
                      fontWeight: 800,
                      zIndex: 1,
                      boxShadow: `0 6px 16px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.4)}`,
                    }}
                  />
                )}
                <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography
                    variant="overline"
                    sx={{ fontWeight: 800, color: featured ? 'primary.main' : 'text.secondary' }}
                  >
                    {plan.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>
                      Rp {plan.amount.toLocaleString('id-ID')}
                    </Typography>
                    <Typography color="text.secondary">/ {plan.period}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {plan.description}
                  </Typography>

                  <Stack spacing={1}>
                    {plan.features.map((f) => (
                      <Stack key={f} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: (t) =>
                              varAlpha(
                                featured
                                  ? t.vars.palette.primary.mainChannel
                                  : t.vars.palette.success.mainChannel,
                                0.12
                              ),
                          }}
                        >
                          <Iconify
                            icon="eva:checkmark-fill"
                            width={14}
                            sx={{ color: featured ? 'primary.main' : 'success.main' }}
                          />
                        </Box>
                        <Typography variant="body2">{f}</Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Box sx={{ mt: 'auto', pt: 2 }}>
                    <Button
                      fullWidth
                      variant={featured ? 'contained' : 'outlined'}
                      disabled={checking === plan.id}
                      onClick={() => handleCheckout(plan)}
                      sx={{ borderRadius: 2, fontWeight: 800, py: 1.2 }}
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
          );
        })}
      </Grid>

      {!loading && plans.length === 0 && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          Belum ada paket tersedia.
        </Typography>
      )}
    </Container>
  );
}
