'use client';

import type { PaymentDetail } from 'src/lib/api/billing';

import { useState, useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { ApiError } from 'src/lib/api/client';
import { getPayment } from 'src/lib/api/billing';
import { getAccessToken } from 'src/lib/api/auth';

// ----------------------------------------------------------------------
// Hasil pembayaran: membaca status dari backend (polling) dan menampilkan
// receipt/invoice. Entitlement hanya aktif setelah webhook valid.
// ----------------------------------------------------------------------

const fmt = (n: number) => n.toLocaleString('id-ID');
const fmtDate = (s?: string | null) => (s ? new Date(s).toLocaleString('id-ID') : '—');

export function PaymentsResultView() {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId') ?? '';
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const cleanup = () => {
      cancelled = true;
    };

    if (!paymentId || !getAccessToken()) {
      return cleanup;
    }

    let tries = 0;

    const poll = async () => {
      try {
        const p = await getPayment(paymentId);
        if (cancelled) return;
        setPayment(p);
        // Poll while pending (provider confirmation).
        if (p.status === 'pending' && tries < 15) {
          tries += 1;
          window.setTimeout(() => {
            void poll();
          }, 2500);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Gagal memuat status pembayaran.');
      }
    };

    poll();
    return cleanup;
  }, [paymentId]);

  if (!paymentId) {
    return (
      <Box sx={{ maxWidth: 560, mx: 'auto', px: 3, py: 10, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          ID transaksi tidak ditemukan.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', px: 3, py: 5 }}>
      {/* Header */}
      <Box
        sx={{
          borderRadius: 3,
          p: { xs: 3, md: 4 },
          mb: 4,
          textAlign: 'center',
          color: '#fff',
          ...theme.mixins.bgGradient({
            images: [
              `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.darkerChannel, 0.92)}, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.85)} 55%, ${varAlpha(theme.vars.palette.secondary.mainChannel, 0.75)})`,
            ],
          }),
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Status Pembayaran
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {!payment && !error && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Pembayaran sedang diverifikasi… Entitlement aktif hanya setelah konfirmasi webhook.
        </Alert>
      )}

      {payment && (
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
            background: `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.05)}, rgba(255,255,255,0))`,
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                Receipt / Invoice
              </Typography>
              <Chip
                size="small"
                label={payment.status}
                variant="soft"
                color={
                  payment.status === 'paid'
                    ? 'success'
                    : payment.status === 'pending'
                      ? 'warning'
                      : 'default'
                }
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ my: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {payment.currency} {fmt(payment.amount)}
              </Typography>
              <Typography color="text.secondary">{payment.plan?.name ?? 'Paket'}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography color="text.secondary">ID Transaksi</Typography>
              <Typography sx={{ fontWeight: 600 }}>{payment.id}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography color="text.secondary">Referensi Provider</Typography>
              <Typography sx={{ fontWeight: 600 }}>{payment.providerReference || '—'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography color="text.secondary">Waktu Dibuat</Typography>
              <Typography sx={{ fontWeight: 600 }}>{fmtDate(payment.createdAt)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography color="text.secondary">Dibayar</Typography>
              <Typography sx={{ fontWeight: 600 }}>{fmtDate(payment.paidAt)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography color="text.secondary">Status</Typography>
              <Typography sx={{ fontWeight: 700 }}>{payment.status}</Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <RouterLink href={paths.payments.root}>
          <Button variant="contained" sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}>
            Lihat Riwayat Pembayaran
          </Button>
        </RouterLink>
      </Box>
    </Box>
  );
}
