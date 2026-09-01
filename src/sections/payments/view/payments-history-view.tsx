'use client';

import type { Payment } from 'src/lib/api/billing';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
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
    <Box sx={{ maxWidth: 760, mx: 'auto', px: 3, py: 8 }}>
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h4">Pembayaran</Typography>
        <Button variant="contained" component="a" href={paths.payments.plans}>
          Pilih Paket
        </Button>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && payments.length === 0 && (
        <Typography color="text.secondary">Belum ada transaksi pembayaran.</Typography>
      )}

      <Stack spacing={2}>
        {payments.map((p) => (
          <Card key={p.id}>
            <CardContent
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{p.planName || p.currency}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Rp {p.amount.toLocaleString('id-ID')} ·{' '}
                  {new Date(p.createdAt).toLocaleDateString('id-ID')}
                </Typography>
              </Box>
              <Chip
                label={p.status}
                color={
                  p.status === 'paid' ? 'success' : p.status === 'pending' ? 'warning' : 'default'
                }
              />
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
