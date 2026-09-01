'use client';

import type { Payment } from 'src/lib/api/billing';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';

import { ApiError } from 'src/lib/api/client';
import { getAccessToken } from 'src/lib/api/auth';
import { getPayments } from 'src/lib/api/billing';

// ----------------------------------------------------------------------
// Riwayat pembayaran (Fase 8).
// ----------------------------------------------------------------------

export function PaymentsHistoryView() {
  const theme = useTheme();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(paths.auth.login);
      return;
    }
    getPayments()
      .then(setPayments)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Gagal memuat riwayat pembayaran.')
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', px: 3, py: 5 }}>
      {/* Header */}
      <Box
        sx={{
          borderRadius: 3,
          p: { xs: 3, md: 4 },
          mb: 4,
          color: '#fff',
          ...theme.mixins.bgGradient({
            images: [
              `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.darkerChannel, 0.92)}, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.85)} 55%, ${varAlpha(theme.vars.palette.secondary.mainChannel, 0.75)})`,
            ],
          }),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Pembayaran
            </Typography>
            <Typography sx={{ opacity: 0.92, mt: 0.5 }}>
              Riwayat transaksi dan status paketmu.
            </Typography>
          </Box>
          <Button
            variant="contained"
            component="a"
            href={paths.payments.plans}
            sx={{
              bgcolor: '#fff',
              color: theme.vars.palette.primary.darker,
              fontWeight: 800,
              '&:hover': { bgcolor: (t) => varAlpha(t.vars.palette.common.whiteChannel, 0.9) },
            }}
          >
            + Pilih Paket
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && payments.length === 0 && (
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
            textAlign: 'center',
            py: 5,
          }}
        >
          <Typography sx={{ fontSize: 40 }}>💳</Typography>
          <Typography color="text.secondary">Belum ada transaksi pembayaran.</Typography>
          <Button
            variant="contained"
            component="a"
            href={paths.payments.plans}
            sx={{ mt: 2, borderRadius: 2, fontWeight: 700 }}
          >
            Pilih Paket
          </Button>
        </Card>
      )}

      <Stack spacing={2}>
        {payments.map((p) => {
          const statusColor =
            p.status === 'paid' ? 'success' : p.status === 'pending' ? 'warning' : 'default';
          return (
            <Card
              key={p.id}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
                background: `linear-gradient(135deg, ${varAlpha(p.status === 'paid' ? theme.vars.palette.success.mainChannel : theme.vars.palette.grey['500Channel'], 0.05)}, rgba(255,255,255,0))`,
                transition: 'transform .18s, box-shadow .18s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 22px rgba(0,0,0,.08)',
                },
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>{p.planName || p.currency}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rp {p.amount.toLocaleString('id-ID')} ·{' '}
                    {new Date(p.createdAt).toLocaleDateString('id-ID')}
                  </Typography>
                </Box>
                <Chip
                  label={p.status}
                  color={statusColor}
                  variant="soft"
                  sx={{ fontWeight: 700 }}
                />
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}
